import { parseFormData } from '@mjackson/form-data-parser';
import { eq, type InferInsertModel } from 'drizzle-orm';
import exif from 'exif-reader';
import sharp from 'sharp';
import { ensureRole } from '~/lib/.server/auth';
import { db } from '~/lib/.server/db';
import { image, user } from '~/lib/.server/schema';
import { maxFileSize } from '~/lib/utils';
import type { Route } from './+types/upload';
import { extname } from 'node:path';
import { getParams } from 'remix-params-helper';
import { z } from 'zod';
import { filestore } from '~/lib/.server/storage/filestore';
import * as mime from 'mime-types';
import type { ImageRecord } from '~/lib/.server/storage/types';

const imageTypes = ['image/jpeg', 'image/png'];

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
				return await filestore.stageUpload(fileUpload);
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
			const mimetype = mime.lookup(extname(path)) || 'application/octet-stream';
			const taken_at = exif_data?.Image?.DateTime ?? new Date();

			const [{ id: user_id }] = await db
				.select({ id: user.id })
				.from(user)
				.where(eq(user.oidc_id, claims.sub))
				.limit(1);

			await db.transaction(async (db) => {
				const data = {
					album_id: album_id,
					mimetype,
					taken_by: user_id,
					taken_at,
					created_by: user_id,
					exif_data,
				} satisfies InferInsertModel<typeof image>;

				const [inserted] = (await db.insert(image).values([data]).returning({
					id: image.id,
					mimetype: image.mimetype,
					album_id: image.album_id,
				})) as ImageRecord[];

				await filestore.commitUpload(path, inserted);
			});
		} catch (error) {
			console.error(`Failed to upload file ${path}`);
			errors.push({ path, msg: 'failed to upload' });
		}
	}
	if (errors.length !== 0) {
		return { success: false, errors };
	}

	return { success: true } as const;
}
