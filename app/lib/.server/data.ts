import { and, asc, count, desc, eq, ilike, sql } from 'drizzle-orm';
import { db } from './db';
import { album, image, legacyImage, tag } from './schema';

export async function getAlbums(page: number, limit: number, search?: string) {
	const albums = await db.query.album.findMany({
		orderBy: [desc(album.start_at)],
		limit: limit,
		offset: page * limit,
		where: and(
			eq(album.published, true),
			search ? ilike(album.name, `%${search}%`) : undefined,
		),
	});
	return albums;
}

export async function getPagesCount(limit: number, search?: string) {
	const [{ total }] = await db
		.select({ total: sql<number>`cast(count(${album.id}) as int)` })
		.from(album)
		.where(search ? ilike(album.name, search) : undefined);
	return Math.ceil(total / limit);
}

export async function getAllAlbums() {
	return await db.query.album.findMany({
		orderBy: [desc(album.start_at)],
	});
}

export async function getImageWindow(id: number, album_id: number) {
	const [res] = await db
		.select({
			imageId: image.id,
			prevId: sql<number>`lag(${image.id}) over (order by ${image.taken_at})`,
			nextId: sql<number>`lead(${image.id}) over (order by ${image.taken_at})`,
		})
		.from(image)
		.where(eq(image.album_id, album_id))
		.having(eq(image.id, id));

	return res;
}

export async function getImage(id: number, unpublished = false) {
	const publishFilter = unpublished ? undefined : eq(album.published, true);
	const [res] = await db
		.select({ image })
		.from(image)
		.innerJoin(album, eq(album.id, image.album_id))
		.where(and(eq(image.id, id), publishFilter))
		.limit(1);

	return res;
}

export async function getLegacyImageData(image: { id: number }) {
	const res = await db
		.select()
		.from(legacyImage)
		.where(eq(legacyImage.image_id, image.id))
		.limit(1);

	return res.length ? res[0] : null;
}

export async function getTags(id: number) {
	return await db.query.tag.findMany({
		where: eq(tag.image_id, id),
		orderBy: [asc(tag.created_at)],
	});
}

export async function getAlbum(id: number) {
	return await db.query.album.findFirst({
		where: and(eq(album.id, id), eq(album.published, true)),
		with: {
			images: {
				columns: {
					id: true,
				},
				orderBy: [asc(image.taken_at)],
			},
		},
	});
}

export async function getAlbumAll(id: number) {
	return await db.query.album.findFirst({
		where: eq(album.id, id),
		with: {
			images: {
				orderBy: [asc(image.taken_at)],
				with: {
					photographer: true,
				},
			},
		},
	});
}
