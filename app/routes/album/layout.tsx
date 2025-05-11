import type { LoaderFunctionArgs, MetaFunction } from 'react-router';
import {
	Outlet,
	type ShouldRevalidateFunction,
	useLoaderData,
} from 'react-router';
import { getAlbum } from '~/lib/.server/data';
import { AlbumContext } from '~/lib/context';
import type { Route } from './+types/layout';

export const meta: Route.MetaFunction = ({ data }) => [
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

export async function loader({ params }: Route.LoaderArgs) {
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
