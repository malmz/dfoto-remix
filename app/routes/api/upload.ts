import { type FileUpload, parseFormData } from '@mjackson/form-data-parser';
import { LocalFileStorage } from '@mjackson/file-storage/local';
import type { InferInsertModel } from 'drizzle-orm';
import exif from 'exif-reader';
import sharp from 'sharp';
import { ensureRole } from '~/lib/.server/auth';
import { db } from '~/lib/.server/db';
import { image } from '~/lib/.server/schema';
import { commitUpload } from '~/lib/.server/storage/image';
import { uploadsPath } from '~/lib/.server/storage/paths';
import { assertResponse, maxFileSize } from '~/lib/utils';
import type { Route } from './+types/upload';
import { extname } from 'node:path';
import { stat } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { getParams } from 'remix-params-helper';
import { z } from 'zod';

const imageTypes = ['image/jpeg', 'image/png'];

export const fileStorage = new LocalFileStorage(uploadsPath);

async function uniqueFile(filepath: string) {
	let ext = extname(filepath);
	let uniqueFilepath = filepath;

	for (
		let i = 1;
		await stat(uniqueFilepath)
			.then(() => true)
			.catch(() => false);
		i++
	) {
		uniqueFilepath =
			(ext ? filepath.slice(0, -ext.length) : filepath) +
			`-${new Date().getTime()}${ext}`;
	}

	return uniqueFilepath;
}

function generateKey(filename: string) {
	const ext = filename ? extname(filename) : '';
	return 'upload_' + randomBytes(4).readUInt32LE(0) + ext;
}

const schema = z.object({
	id: z.number().int('Invalid album id'),
	files: z.string().array().min(1, 'At least 1 file is required'),
});

export async function action({ request, context }: Route.ActionArgs) {
	const { claims } = ensureRole(['write:image'], context);

	const formData = await parseFormData(
		request,
		{ maxFileSize },
		async (fileUpload) => {
			if (
				fileUpload.fieldName === 'files' &&
				imageTypes.includes(fileUpload.type)
			) {
				let filename = generateKey(fileUpload.name);
				while (await fileStorage.has(filename)) {
					filename = generateKey(fileUpload.name);
				}
				await fileStorage.set(filename, fileUpload);
				return filename;
			}
		},
	);

	const result = getParams(formData, schema);

	if (!result.success) {
		return { success: result.success, errors: result.errors };
	}

	const { id: album_id, files } = result.data;

	const errors = [];
	for (const path of files) {
		try {
			const metadata = await sharp(path).metadata();
			const exif_data = metadata.exif ? exif(metadata.exif) : (null as any);
			const file;
			const taken_at = exif_data?.Image?.DateTime ?? new Date();

			const data = {
				album_id: album_id,
				mimetype: file.type,
				taken_by: claims?.sub,
				taken_at,
				created_by: claims?.sub,
				exif_data,
			} satisfies InferInsertModel<typeof image>;

			await db.transaction(async (db) => {
				const inserted = await db.insert(image).values([data]).returning({
					id: image.id,
					mimetype: image.mimetype,
					album_id: image.album_id,
				});

				await Promise.all(
					inserted.map(async (image, i) => {
						commitUpload(files[i].getFilePath(), image);
					}),
				);
			});
		} catch (error) {
			console.error(`Failed to upload file ${path}`);
			errors.push({ path, msg: 'failed to upload' });
		}
	}
	if (errors.length !== 0) {
		return { success: false, errors };
	}

	const insertdata = await Promise.all(
		files.map(async (file) => {
			const metadata = await sharp(file.stream()).metadata();
			const exif_data = metadata.exif ? exif(metadata.exif) : (null as any);

			const taken_at = exif_data?.Image?.DateTime ?? new Date();

			return {
				album_id: album_id,
				mimetype: metadata,
				taken_by: claims?.sub,
				taken_at,
				created_by: claims?.sub,
				exif_data,
			} satisfies InferInsertModel<typeof image>;
		}),
	);

	await db.transaction(async (db) => {
		const inserted = await db.insert(image).values(insertdata).returning({
			id: image.id,
			mimetype: image.mimetype,
			album_id: image.album_id,
		});

		await Promise.all(
			inserted.map(async (image, i) => {
				commitUpload(files[i].getFilePath(), image);
			}),
		);
	});

	return { success: true } as const;
}
