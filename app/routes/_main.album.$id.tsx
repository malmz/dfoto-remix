import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import {
	Outlet,
	type ShouldRevalidateFunction,
	useLoaderData,
} from '@remix-run/react';
import { createContext, useContext } from 'react';
import { getAlbum } from '~/lib/.server/data';
import { AlbumContext } from '~/lib/context';

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
	const album = await getAlbum(Number(params.id));
	if (!album) throw new Response('Not found', { status: 404 });
	return { album };
}

export type AlbumLoader = typeof loader;

export default function Page() {
	const { album } = useLoaderData<typeof loader>();
	return (
		<AlbumContext.Provider value={album}>
			<Outlet />
		</AlbumContext.Provider>
	);
}
