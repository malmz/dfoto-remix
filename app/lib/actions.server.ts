import { and, asc, eq, isNull, sql, type InferInsertModel } from 'drizzle-orm';
import { db } from './db.server';
import { album, image, type CreateAlbum } from './schema.server';

export async function createAlbum(data: CreateAlbum) {
  await db.insert(album).values(data);
}

export async function updateAlbum(id: number, data: CreateAlbum) {
  const moreData: Partial<InferInsertModel<typeof album>> = {
    ...data,
    modified_at: new Date(),
  };
  await db.update(album).set(moreData).where(eq(album.id, id));
}

export async function setPubishedStatus(id: number, published: boolean) {
  await db.transaction(async (tx) => {
    if (published) {
      const [{ total }] = await db
        .select({ total: sql<number>`cast(count(${image.id}) as int)` })
        .from(image)
        .where(eq(image.album_id, id));

      if (total === 0) {
        tx.rollback();
      }

      // Ensure that the album has a thumbnail
      const [{ id: firstImageId }] = await db
        .select({ id: image.id })
        .from(image)
        .where(eq(image.album_id, id))
        .orderBy(asc(image.taken_at))
        .limit(1);

      await db
        .update(album)
        .set({ thumbnail_id: firstImageId })
        .where(and(eq(album.id, id), isNull(album.thumbnail_id)));
    }

    await db.update(album).set({ published }).where(eq(album.id, id));
  });
}
