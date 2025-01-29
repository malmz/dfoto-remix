import { and, asc, count, desc, eq, ilike, sql } from 'drizzle-orm';
import { db } from './db';
import {
	albumTable,
	imageTable,
	legacyImageTable,
	tagTable,
	userTable,
} from './schema';

export async function getAlbums(page: number, limit: number, search?: string) {
	const albums = await db.query.album.findMany({
		orderBy: [desc(albumTable.start_at)],
		limit: limit,
		offset: page * limit,
		where: and(
			eq(albumTable.published, true),
			search ? ilike(albumTable.name, `%${search}%`) : undefined,
		),
	});
	return albums;
}

export async function getPagesCount(limit: number, search?: string) {
	const [{ total }] = await db
		.select({ total: sql<number>`cast(count(${albumTable.id}) as int)` })
		.from(albumTable)
		.where(search ? ilike(albumTable.name, search) : undefined);
	return Math.ceil(total / limit);
}

export async function getAllAlbums() {
	return await db.query.album.findMany({
		orderBy: [desc(albumTable.start_at)],
	});
}

export async function getAlbumName(id: number) {
	const [data] = await db
		.select({ id: albumTable.id, name: albumTable.name })
		.from(albumTable)
		.where(eq(albumTable.id, id))
		.limit(1);

	return data;
}

export async function getImageWindow(id: number, album_id: number) {
	const [res] = await db
		.select({
			imageId: imageTable.id,
			prevId: sql<number>`lag(${imageTable.id}) over (order by ${imageTable.taken_at})`,
			nextId: sql<number>`lead(${imageTable.id}) over (order by ${imageTable.taken_at})`,
		})
		.from(imageTable)
		.where(eq(imageTable.album_id, album_id))
		.having(eq(imageTable.id, id));

	return res;
}

export async function getImage(id: number, unpublished = false) {
	const publishFilter = unpublished
		? undefined
		: eq(albumTable.published, true);
	const [res] = await db
		.select({
			image: imageTable,
			album: { id: albumTable.id, name: albumTable.name },
		})
		.from(imageTable)
		.innerJoin(albumTable, eq(albumTable.id, imageTable.album_id))
		.where(and(eq(imageTable.id, id), publishFilter))
		.limit(1);

	return res;
}

export async function getLegacyImageData(image: { id: number }) {
	const res = await db
		.select()
		.from(legacyImageTable)
		.where(eq(legacyImageTable.image_id, image.id))
		.limit(1);

	return res.length ? res[0] : null;
}

export async function getTags(id: number) {
	return await db.query.tag.findMany({
		where: eq(tagTable.image_id, id),
		orderBy: [asc(tagTable.created_at)],
	});
}

export async function getAlbum(id: number) {
	return await db.query.album.findFirst({
		where: and(eq(albumTable.id, id), eq(albumTable.published, true)),
		with: {
			images: {
				columns: {
					id: true,
				},
				orderBy: [asc(imageTable.taken_at)],
			},
		},
	});
}

export async function getAlbumAll(id: number) {
	return await db.query.album.findFirst({
		where: eq(albumTable.id, id),
		with: {
			images: {
				orderBy: [asc(imageTable.taken_at)],
				with: {
					photographer: true,
				},
			},
		},
	});
}

export async function getUsers() {
	return await db.select().from(userTable);
}
