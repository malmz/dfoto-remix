import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "./db";
import { album, image } from "./schema";

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

export async function getImage(id: number) {
  const { passed } = await checkRole(["read:album"]);
  const isPublished = !passed ? eq(album.published, true) : undefined;
  const [{ image: data }] = await db
    .select({
      image,
    })
    .from(image)
    .innerJoin(album, eq(album.id, image.album_id))
    .where(and(eq(image.id, id), isPublished))
    .limit(1);

  return data;
}
