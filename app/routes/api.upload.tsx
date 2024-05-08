import { parseWithZod } from '@conform-to/zod';
import {
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createFileUploadHandler as createFileUploadHandler,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  unstable_parseMultipartFormData as parseMultipartFormData,
  json,
  type ActionFunctionArgs,
} from '@remix-run/node';
import { z } from 'zod';
import { uploadsPath } from '~/lib/storage.server';
import sharp from 'sharp';
import path from 'node:path';

const imageTypes = ['image/jpeg', 'image/png'];

const schema = z.object({
  id: z.coerce.number(),
  files: z.array(z.instanceof(File)).min(1, 'At least 1 file is required'),
});

export async function action({ request }: ActionFunctionArgs) {
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
    return json(submission.reply());
  }

  const insertdata = await Promise.all(
    submission.value.files.map(async (file, i) => {
      const metadata = await sharp(file.stream()).metadata();
      const exif_data = metadata.exif ? exif(metadata.exif) : null;
      const taken_at =
        exif_data?.Image?.DateTime ?? new Date(file.lastModified) ?? new Date();

      return {
        album_id: data.album,
        mimetype: file.type,
        taken_by: user.id,
        taken_by_name: user.name ?? user.email ?? null,
        taken_at,
        exif_data,
      } satisfies InferInsertModel<typeof image>;
    })
  );
}
