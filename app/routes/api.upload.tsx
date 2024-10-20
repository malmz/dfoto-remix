import {
	type ActionFunctionArgs,
	NodeOnDiskFile,
	unstable_composeUploadHandlers as composeUploadHandlers,
	unstable_createFileUploadHandler as createFileUploadHandler,
	unstable_createMemoryUploadHandler as createMemoryUploadHandler,
	unstable_parseMultipartFormData as parseMultipartFormData,
} from '@remix-run/node';
import type { InferInsertModel } from 'drizzle-orm';
import exif from 'exif-reader';
import sharp from 'sharp';
import { ensureRole } from '~/lib/.server/auth';
import { db } from '~/lib/.server/db';
import { image } from '~/lib/.server/schema';
import { commitUpload } from '~/lib/.server/storage/image';
import { uploadsPath } from '~/lib/.server/storage/paths';
import { assertResponse } from '~/lib/utils';

const imageTypes = ['image/jpeg', 'image/png'];

export async function action({ request, context }: ActionFunctionArgs) {
	const { claims } = ensureRole(['write:image'], context);

	const uploadHandler = composeUploadHandlers(
		createFileUploadHandler({
			directory: uploadsPath,
			filter: ({ contentType }) => imageTypes.includes(contentType),
		}),
		createMemoryUploadHandler(),
	);

	const formData = await parseMultipartFormData(request, uploadHandler);
	const id = Number(formData.get('id'));
	assertResponse(!Number.isNaN(id), 'Invalid album id');
	const files = formData.getAll('files') as NodeOnDiskFile[];
	assertResponse(files.length > 0, 'At least 1 file is required');
	assertResponse(
		files.every((file) => file instanceof NodeOnDiskFile),
		'Invalid file',
	);

	const insertdata = await Promise.all(
		files.map(async (file) => {
			const metadata = await sharp(file.getFilePath()).metadata();
			const exif_data = metadata.exif ? exif(metadata.exif) : (null as any);
			const taken_at =
				exif_data?.Image?.DateTime ?? new Date(file.lastModified) ?? new Date();

			return {
				album_id: id,
				mimetype: file.type,
				taken_by: claims?.sub,
				taken_by_name: claims?.name ?? claims?.email ?? null,
				taken_at,
				created_by: claims?.sub,
				exif_data,
			} satisfies InferInsertModel<typeof image>;
		}),
	);

	db.transaction(async (db) => {
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
