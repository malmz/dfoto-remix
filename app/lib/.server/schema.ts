import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { isNotNull, or, relations, sql } from 'drizzle-orm';
import {
	boolean,
	check,
	date,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
} from 'drizzle-orm/pg-core';
import type { Exif } from 'exif-reader';

export const albumTable = pgTable('album', {
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

export const legacyAlbumTable = pgTable('legacy_album', {
	id: text().primaryKey(),
	album_id: integer()
		.references(() => albumTable.id, { onDelete: 'cascade' })
		.notNull(),
});

export const albumRelation = relations(albumTable, ({ many, one }) => ({
	images: many(imageTable),
	legacy: one(legacyAlbumTable, {
		fields: [albumTable.id],
		references: [legacyAlbumTable.album_id],
	}),
}));

export type Album = InferSelectModel<typeof albumTable>;
export type CreateAlbum = Omit<
	InferInsertModel<typeof albumTable>,
	'created_at' | 'modified_at'
>;

export const imageTable = pgTable(
	'image',
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		mimetype: text().notNull(),
		album_id: integer().references(() => albumTable.id, {
			onDelete: 'set null',
		}),
		exif_data: jsonb().$type<Exif>(),
		taken_by: integer().references(() => userTable.id),
		taken_by_override: text(),
		taken_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
		created_by: integer().references(() => userTable.id),
		created_at: timestamp({ mode: 'date', withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		{
			checkConstraint: check(
				'check_taken_by',
				or(isNotNull(table.taken_by), isNotNull(table.taken_by_override))!,
			),
		},
	],
);

export const legacyImageTable = pgTable('legacy_image', {
	id: text().primaryKey(),
	image_id: integer()
		.references(() => imageTable.id, { onDelete: 'cascade' })
		.notNull(),
	filepath: text().notNull(),
});

export type Image = InferSelectModel<typeof imageTable>;
export type CreateImage = Omit<
	InferInsertModel<typeof imageTable>,
	'created_at'
>;

export const imageRelation = relations(imageTable, ({ one, many }) => ({
	album: one(albumTable, {
		fields: [imageTable.album_id],
		references: [albumTable.id],
	}),
	legacy: one(legacyImageTable, {
		fields: [imageTable.id],
		references: [legacyImageTable.image_id],
	}),
	photographer: one(userTable, {
		fields: [imageTable.taken_by],
		references: [userTable.id],
	}),
	tags: many(tagTable),
}));

export const imageToTagsTable = pgTable('image_to_tags', {
	image_id: integer()
		.notNull()
		.references(() => imageTable.id),
});

export const tagTable = pgTable('tag', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	text: text().notNull(),
	image_id: integer()
		.references(() => imageTable.id, { onDelete: 'cascade' })
		.notNull(),
	created_by: text(),
	created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const legacyTagTable = pgTable('legacy_tag', {
	id: text().primaryKey(),
	tag_id: integer()
		.references(() => tagTable.id, { onDelete: 'cascade' })
		.notNull(),
});

export const tagRelation = relations(tagTable, ({ one }) => ({
	image: one(imageTable, {
		fields: [tagTable.image_id],
		references: [imageTable.id],
	}),
	legacy: one(legacyTagTable, {
		fields: [tagTable.id],
		references: [legacyTagTable.tag_id],
	}),
}));

export const userTable = pgTable('user', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	keycloak_id: text().notNull().unique(),
	name: text().notNull(),
});

export const sessionTable = pgTable('session', {
	id: text().primaryKey(),
	data: jsonb().notNull(),
	expires_at: timestamp({ withTimezone: true }),
});
