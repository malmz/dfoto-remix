import {
  createReadableStreamFromReadable,
  type LoaderFunctionArgs,
} from '@remix-run/node';
import { getImage } from '~/lib/data.server';
import { getImagePath } from '~/lib/storage.server';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { assertResponse } from '~/lib/utils';

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const id = Number(params.id);
  assertResponse(!Number.isNaN(id), 'Invalid image id');

  const data = await getImage(id);
  assertResponse(data, 'Image not found', { status: 404 });

  const imagePath = getImagePath(data.image);
  const fileStat = await stat(imagePath);

  return new Response(
    createReadableStreamFromReadable(createReadStream(imagePath)),
    {
      headers: {
        'Content-Type': data.image.mimetype ?? '',
        'Content-Length': fileStat.size.toString(),
        'Content-Disposition': `inline; filename="${data.image.id}"`,
        'Cache-Control': 'public, max-age=604800, immutable',
      },
    }
  );
};
