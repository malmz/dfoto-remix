import type { LoaderFunctionArgs } from '@remix-run/node';
import { getImage } from '~/lib/data.server';
import { getImageStream } from '~/lib/storage.server';

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const id = Number(params.id);
  if (Number.isNaN(id)) return Response.error();
  const data = await getImage(id);
  if (!data)
    throw new Response(null, { status: 404, statusText: 'Image not found' });
  const stream = await getImageStream(data.image);
  return new Response(stream, {
    headers: {
      'Content-Type': data.image.mimetype ?? '',
      'Cache-Control': 'max-age=300, s-maxage=3600',
    },
  });
};
