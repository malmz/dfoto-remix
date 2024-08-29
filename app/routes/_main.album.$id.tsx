import {
	unstable_defineLoader as defineLoader,
	type LoaderFunctionArgs,
	type MetaFunction,
} from '@remix-run/node';
import {
	Outlet,
	useLoaderData,
	type ShouldRevalidateFunction,
} from '@remix-run/react';
import { createContext, useContext } from 'react';
import { AlbumContext } from '~/lib/context';
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

export const loader = defineLoader(async ({ params }) => {
	const album = await getAlbum(Number(params.id));
	if (!album) throw new Response('Not found', { status: 404 });
	return { album };
});

export type AlbumLoader = typeof loader;

export default function Page() {
	const { album } = useLoaderData<typeof loader>();
	return (
		<AlbumContext.Provider value={album}>
			<Outlet />
		</AlbumContext.Provider>
	);
}
