import { Await, Form, redirect, useLoaderData } from 'react-router';
import { Suspense } from 'react';
import { Album } from '~/components/album';
import { AutoGrid } from '~/components/autogrid';
import { Paginator } from '~/components/paginator';
import { Input } from '~/components/ui/input';
import { getAlbums, getPagesCount } from '~/lib/.server/data';
import type { Route } from './+types/index';

export const loader = async ({ request }: Route.LoaderArgs) => {
	const queryParams = new URL(request.url).searchParams;
	if (queryParams.get('page') === '1') throw redirect('/');
	const page = Math.max(
		queryParams.get('page') ? Number.parseInt(queryParams.get('page')!) : 1,
		1,
	);
	const albums = getAlbums(page - 1, 28, queryParams.get('q')!);
	const totalPages = await getPagesCount(28, queryParams.get('q')!);
	return {
		page,
		totalPages,
		albums,
	};
};

export default function Page() {
	const { totalPages, albums, page } = useLoaderData<typeof loader>();

	return (
		<>
			<div className='grow space-y-4 px-2 pb-6'>
				<Form className='mx-auto max-w-md'>
					<Input type='search' placeholder='Sök efter album' name='q' />
				</Form>
				<Suspense fallback={<div>Loading...</div>}>
					<AutoGrid>
						<Await resolve={albums}>
							{(albums) =>
								albums.map((album) => <Album key={album.id} album={album} />)
							}
						</Await>
					</AutoGrid>
				</Suspense>
			</div>
			<Paginator page={page} totalPages={totalPages} />
		</>
	);
}
