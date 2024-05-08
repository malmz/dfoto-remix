import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { db } from './db.server';
import { album, image } from './schema.server';

export async function getAlbums(page: number, limit: number) {
  const albums = await db.query.album.findMany({
    orderBy: [desc(album.start_at)],
    limit: limit,
    offset: page * limit,
    where: eq(album.published, true),
  });
  return albums;
}

export async function getPagesCount(limit: number) {
  const [{ total }] = await db
    .select({ total: sql<number>`cast(count(${album.id}) as int)` })
    .from(album);
  return Math.ceil(total / limit);
}

export async function getAllAlbums() {
  return await db.query.album.findMany({
    orderBy: [desc(album.start_at)],
  });
}

export async function getImage(id: number, unpublished = false) {
  const publishFilter = unpublished ? undefined : eq(album.published, true);
  const res = await db
    .select({
      image,
      albumName: album.name,
    })
    .from(image)
    .innerJoin(album, eq(album.id, image.album_id))
    .where(and(eq(image.id, id), publishFilter))
    .limit(1);

  return res.length ? res[0] : null;
}

export async function getAlbum(id: number, unpublished = false) {
  const publishFilter = unpublished ? undefined : eq(album.published, true);
  return await db.query.album.findFirst({
    where: and(eq(album.id, id), publishFilter),
    with: {
      images: {
        orderBy: [asc(image.taken_at)],
      },
    },
  });
}
