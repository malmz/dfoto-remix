import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  boolean,
  date,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import type { Exif } from 'exif-reader';
import type { Jsonify } from '@remix-run/server-runtime/dist/jsonify';

export const album = pgTable('album', {
  id: serial('id').primaryKey(),
  legacy_id: text('legacy_id').unique(),
  name: text('name').notNull(),
  description: text('description'),
  published: boolean('published').default(false).notNull(),
  start_at: date('start_at', { mode: 'date' }).defaultNow().notNull(),
  thumbnail_id: integer('thumbnail_id'),
  created_at: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  modified_at: timestamp('modified_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
});

export const legacyAlbum = pgTable('legacy_album', {
  id: text('id').primaryKey(),
  album_id: integer('album_id')
    .references(() => album.id)
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
  'legacy_id' | 'created_at' | 'modified_at'
>;

export const image = pgTable('image', {
  id: serial('id').primaryKey(),
  legacy_id: text('legacy_id').unique(),
  exif_data: jsonb('exif_data').$type<Jsonify<Exif>>(),
  mimetype: text('mimetype'),
  album_id: integer('album_id')
    .references(() => album.id, { onDelete: 'cascade' })
    .notNull(),
  taken_by: text('taken_by'),
  taken_by_name: text('taken_by_name'),
  taken_at: timestamp('taken_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  created_by: text('created_by'),
  created_at: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const legacyImage = pgTable('legacy_image', {
  id: text('id').primaryKey(),
  image_id: integer('image_id')
    .references(() => image.id)
    .notNull(),
  filepath: text('filepath').notNull(),
});

export type Image = InferSelectModel<typeof image>;

export const imageRelation = relations(image, ({ one, many }) => ({
  album: one(album, {
    fields: [image.album_id],
    references: [album.id],
  }),
  legacy: one(legacyImage, {
    fields: [image.id],
    references: [legacyImage.image_id],
  }),
  tags: many(tag),
}));

export const tag = pgTable('tag', {
  id: serial('id').primaryKey(),
  legacy_id: text('legacy_id').unique().notNull(),
  text: text('text').notNull(),
  image_id: integer('image_id')
    .references(() => image.id)
    .notNull(),
  created_by: text('created_by'),
  created_at: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const legacyTag = pgTable('legacy_tag', {
  id: text('id').primaryKey(),
  tag_id: integer('tag_id')
    .references(() => tag.id)
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
