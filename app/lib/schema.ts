import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';
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
import { Exif } from 'exif-reader';

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
    .notNull(),
});

export const albumRelation = relations(album, ({ many }) => ({
  images: many(image),
}));

export type Album = InferSelectModel<typeof album>;
export type CreateAlbum = Omit<
  InferInsertModel<typeof album>,
  'legacy_id' | 'created_at' | 'modified_at'
>;

export const image = pgTable('image', {
  id: serial('id').primaryKey(),
  legacy_id: text('legacy_id').unique(),
  exif_data: jsonb('exif_data').$type<Exif>(),
  mimetype: text('mimetype'),
  album_id: integer('album_id')
    .references(() => album.id)
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

export type Image = InferSelectModel<typeof image>;

export const imageRelation = relations(image, ({ one, many }) => ({
  album: one(album, {
    fields: [image.album_id],
    references: [album.id],
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

export const tagRelation = relations(tag, ({ one }) => ({
  image: one(image, {
    fields: [tag.image_id],
    references: [image.id],
  }),
}));
