import type { Jsonify } from '@remix-run/server-runtime/dist/jsonify';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
	boolean,
	date,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
} from 'drizzle-orm/pg-core';
import type { Exif } from 'exif-reader';

export const album = pgTable('album', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	name: text().notNull(),
	description: text(),
	published: boolean().default(false).notNull(),
	start_at: date({ mode: 'date' }).defaultNow().notNull(),
	thumbnail_id: integer(),
	created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
	modified_at: timestamp({ withTimezone: true })
		.defaultNow()
		.notNull()
		.$onUpdateFn(() => new Date()),
});

export const legacyAlbum = pgTable('legacy_album', {
	id: text().primaryKey(),
	album_id: integer()
		.references(() => album.id, { onDelete: 'cascade' })
		.notNull(),
});

export const albumRelation = relations(album, ({ many, one }) => ({
	images: many(image),
	legacy: one(legacyAlbum, {
		fields: [album.id],
		references: [legacyAlbum.album_id],
	}),
}));

export type Album = InferSelectModel<typeof album>;
export type CreateAlbum = Omit<
	InferInsertModel<typeof album>,
	'created_at' | 'modified_at'
>;

export const image = pgTable('image', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	exif_data: jsonb().$type<Jsonify<Exif>>(),
	mimetype: text(),
	album_id: integer()
		.references(() => album.id, { onDelete: 'cascade' })
		.notNull(),
	taken_by: text().references(() => user.id),
	taken_by_name: text(),
	taken_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
	created_by: text().references(() => user.id),
	created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const legacyImage = pgTable('legacy_image', {
	id: text().primaryKey(),
	image_id: integer()
		.references(() => image.id, { onDelete: 'cascade' })
		.notNull(),
	filepath: text().notNull(),
});

export type Image = InferSelectModel<typeof image>;
export type CreateImage = Omit<InferInsertModel<typeof image>, 'created_at'>;

export const imageRelation = relations(image, ({ one, many }) => ({
	album: one(album, {
		fields: [image.album_id],
		references: [album.id],
	}),
	legacy: one(legacyImage, {
		fields: [image.id],
		references: [legacyImage.image_id],
	}),
	photographer: one(user, {
		fields: [image.taken_by],
		references: [user.id],
	}),
	tags: many(tag),
}));

export const imageToTags = pgTable('image_to_tags', {
	image_id: integer()
		.notNull()
		.references(() => image.id),
});

export const tag = pgTable('tag', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	text: text().notNull(),
	image_id: integer()
		.references(() => image.id, { onDelete: 'cascade' })
		.notNull(),
	created_by: text(),
	created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const legacyTag = pgTable('legacy_tag', {
	id: text().primaryKey(),
	tag_id: integer()
		.references(() => tag.id, { onDelete: 'cascade' })
		.notNull(),
});

export const tagRelation = relations(tag, ({ one }) => ({
	image: one(image, {
		fields: [tag.image_id],
		references: [image.id],
	}),
	legacy: one(legacyTag, {
		fields: [tag.id],
		references: [legacyTag.tag_id],
	}),
}));

export const user = pgTable('user', {
	id: text().primaryKey(),
	name: text().notNull(),
});

export const session = pgTable('session', {
	id: text().primaryKey(),
	data: jsonb().notNull(),
	expires_at: timestamp({ withTimezone: true }),
});
