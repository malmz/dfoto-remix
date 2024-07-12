import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import type { ShouldRevalidateFunction } from '@remix-run/react';
import { getAlbum } from '~/lib/server/data';

export const meta: MetaFunction<typeof loader> = ({ data }) => [
	{ title: data ? `DFoto - ${data.album.name}` : undefined },
];

export const shouldRevalidate: ShouldRevalidateFunction = ({
	defaultShouldRevalidate,
	currentParams,
	nextParams,
}) => {
	if (currentParams.id === nextParams.id) return false;
	return defaultShouldRevalidate;
};

export async function loader({ params }: LoaderFunctionArgs) {
	console.log('loading parent');

	const album = await getAlbum(Number(params.id));
	if (!album) throw new Response('Not found', { status: 404 });
	return { album };
}

export type AlbumLoader = typeof loader;
