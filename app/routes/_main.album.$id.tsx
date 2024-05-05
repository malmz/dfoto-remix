import type { LoaderFunctionArgs } from '@remix-run/node';
import { getAlbum } from '~/lib/data.server';

export async function loader({ params }: LoaderFunctionArgs) {
  const album = await getAlbum(Number(params.id));
  if (!album) throw new Response('Not found', { status: 404 });
  return { album };
}

export type AlbumLoader = typeof loader;
