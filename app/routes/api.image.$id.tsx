import { type LoaderFunctionArgs } from '@remix-run/node';
import { getImage } from '~/lib/data.server';
import { assertResponse } from '~/lib/utils';
import { checkRole } from '~/lib/auth.server';
import { getThumbnailStream } from '~/lib/storage/thumbnail';
import { getPreviewStream } from '~/lib/storage/preview';
import { getImageStream } from '~/lib/storage/image';
import type { ImageStream } from '~/lib/storage/types';
import { extension } from 'mime-types';

const ensure = true;

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { passed } = await checkRole(['read:album'])(request);

  const id = Number(params.id);
  assertResponse(!Number.isNaN(id), 'Invalid image id');

  const data = await getImage(id, passed);
  assertResponse(data, 'Image not found', { status: 404 });

  const query = new URL(request.url).searchParams;
  const thumbnail = query.get('thumbnail') != null;
  const preview = query.get('preview') != null;

  assertResponse(!(thumbnail && preview), 'Invalid query parameters');

  let imageStream: ImageStream;
  if (thumbnail) {
    imageStream = await getThumbnailStream(data.image, ensure);
  } else if (preview) {
    imageStream = await getPreviewStream(data.image, ensure);
  } else {
    imageStream = await getImageStream(data.image, ensure);
  }

  const ext = data.image.mimetype ? extension(data.image.mimetype) || '' : '';

  return new Response(imageStream.stream, {
    headers: {
      'Content-Type': imageStream.mimetype ?? 'application/octet-stream',
      'Content-Length': imageStream.size?.toString() ?? '',
      'Content-Disposition': `inline; filename="${imageStream.id}.${ext}"`,
      'Cache-Control': 'public, max-age=604800, immutable',
    },
  });
};
