import { and, asc, eq, isNull } from 'drizzle-orm';
import { db } from './db';
import {
	type CreateAlbum,
	type CreateImage,
	albumTable,
	imageTable,
	tagTable,
} from './schema';
import { deleteAlbumFiles, deleteImageFiles } from './storage/image';

export async function createAlbum(data: CreateAlbum) {
	return await db
		.insert(albumTable)
		.values(data)
		.returning({ id: albumTable.id });
}

export async function updateAlbum(id: number, data: Partial<CreateAlbum>) {
	await db.update(albumTable).set(data).where(eq(albumTable.id, id));
}

export async function updateImage(id: number, data: Partial<CreateImage>) {
	await db.update(imageTable).set(data).where(eq(imageTable.id, id));
}

export async function setThumbnail(id: number, thumbnail_id: number) {
	await db
		.update(albumTable)
		.set({ thumbnail_id })
		.where(eq(albumTable.id, id));
}

// NOTE: This function lets indirectly set the thumbnail of an album if empty.
export async function setPubishedStatus(id: number, published: boolean) {
	await db.transaction(async (tx) => {
		if (published) {
			// Ensure that the album has a thumbnail
			const images = await db
				.select({ id: imageTable.id })
				.from(imageTable)
				.where(eq(imageTable.album_id, id))
				.orderBy(asc(imageTable.taken_at))
				.limit(1);

			if (images.length === 0) {
				tx.rollback();
			}

			await db
				.update(albumTable)
				.set({ thumbnail_id: images[0].id })
				.where(and(eq(albumTable.id, id), isNull(albumTable.thumbnail_id)));
		}

		await db.update(albumTable).set({ published }).where(eq(albumTable.id, id));
	});
}

export async function deleteAlbum(id: number) {
	await db.delete(albumTable).where(eq(albumTable.id, id));
	await deleteAlbumFiles(id);
}

export async function deleteImage(id: number) {
	const [data] = await db
		.delete(imageTable)
		.where(eq(imageTable.id, id))
		.returning();
	deleteImageFiles(data);
}

export async function addTag(
	image_id: number,
	text: string,
	created_by: string,
) {
	db.insert(tagTable)
		.values({ image_id, text, created_by })
		.onConflictDoNothing()
		.returning();
}
