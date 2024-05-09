import { parseWithZod } from '@conform-to/zod';
import {
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createFileUploadHandler as createFileUploadHandler,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  unstable_parseMultipartFormData as parseMultipartFormData,
  json,
  type ActionFunctionArgs,
  NodeOnDiskFile,
} from '@remix-run/node';
import { z } from 'zod';
import { commitUpload, uploadsPath } from '~/lib/storage.server';
import sharp from 'sharp';
import path from 'node:path';
import type { InferInsertModel } from 'drizzle-orm';
import { image } from '~/lib/schema.server';
import exif from 'exif-reader';
import type { Serializable } from '@remix-run/react/future/single-fetch';
import { authenticator } from '~/lib/auth.server';
import { db } from '~/lib/db.server';

const imageTypes = ['image/jpeg', 'image/png'];

const schema = z.object({
  id: z.coerce.number(),
  files: z
    .array(z.instanceof(NodeOnDiskFile))
    .min(1, 'At least 1 file is required'),
});

export async function action({ request }: ActionFunctionArgs) {
  const session = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const user = session.user!;

  const uploadHandler = composeUploadHandlers(
    createFileUploadHandler({
      directory: uploadsPath,
      filter: ({ contentType }) => imageTypes.includes(contentType),
    }),
    createMemoryUploadHandler()
  );

  const formData = await parseMultipartFormData(request, uploadHandler);
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    console.log(submission.reply());
    return new Response('Bad Request', { status: 400 });
  }

  const insertdata = await Promise.all(
    submission.value.files.map(async (file, i) => {
      const metadata = await sharp(file.getFilePath()).metadata();
      const exif_data = metadata.exif ? exif(metadata.exif) : (null as any);
      const taken_at =
        exif_data?.Image?.DateTime ?? new Date(file.lastModified) ?? new Date();

      return {
        album_id: submission.value.id,
        mimetype: file.type,
        taken_by: user.id,
        taken_by_name: user.name ?? user.email ?? null,
        taken_at,
        created_by: user.id,
        exif_data,
      } satisfies InferInsertModel<typeof image>;
    })
  );

  db.transaction(async (db) => {
    const inserted = await db.insert(image).values(insertdata).returning({
      id: image.id,
      mimetype: image.mimetype,
      album_id: image.album_id,
    });

    await Promise.all(
      inserted.map(async (image, i) => {
        commitUpload(submission.value.files[i].getFilePath(), image);
      })
    );
  });

  return new Response('Created', { status: 201 });
}
