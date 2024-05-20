import { and, asc, eq, isNull } from 'drizzle-orm';
import { db } from './db.server';
import { album, image, type CreateAlbum } from './schema.server';
import { deleteAlbumFiles, deleteImageFiles } from './storage/image';

export async function createAlbum(data: CreateAlbum) {
  return await db.insert(album).values(data).returning({ id: album.id });
}

export async function updateAlbum(id: number, data: CreateAlbum) {
  await db.update(album).set(data).where(eq(album.id, id));
}

export async function setThumbnail(id: number, thumbnail_id: number) {
  await db.update(album).set({ thumbnail_id }).where(eq(album.id, id));
}

// NOTE: This function lets indirectly set the thumbnail of an album if empty.
export async function setPubishedStatus(id: number, published: boolean) {
  await db.transaction(async (tx) => {
    if (published) {
      // Ensure that the album has a thumbnail
      const images = await db
        .select({ id: image.id })
        .from(image)
        .where(eq(image.album_id, id))
        .orderBy(asc(image.taken_at))
        .limit(1);

      if (images.length === 0) {
        tx.rollback();
      }

      await db
        .update(album)
        .set({ thumbnail_id: images[0].id })
        .where(and(eq(album.id, id), isNull(album.thumbnail_id)));
    }

    await db.update(album).set({ published }).where(eq(album.id, id));
  });
}

export async function deleteAlbum(id: number) {
  await db.delete(album).where(eq(album.id, id));
  await deleteAlbumFiles(id);
}

export async function deleteImage(id: number) {
  const [data] = await db.delete(image).where(eq(image.id, id)).returning();
  deleteImageFiles(data);
}
