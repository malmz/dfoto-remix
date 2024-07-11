import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { getAlbum } from '~/lib/server/data';

export const meta: MetaFunction<typeof loader> = ({ data }) => [
	{ title: data ? `DFoto - ${data.album.name}` : undefined },
];

export async function loader({ params }: LoaderFunctionArgs) {
	const album = await getAlbum(Number(params.id));
	if (!album) throw new Response('Not found', { status: 404 });
	return { album };
}

export type AlbumLoader = typeof loader;
