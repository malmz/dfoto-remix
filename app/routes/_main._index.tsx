import type { LoaderFunctionArgs } from '@remix-run/node';
import { Await, Form, redirect, useLoaderData } from '@remix-run/react';
import { Suspense } from 'react';
import { Album } from '~/components/album';
import { AutoGrid } from '~/components/autogrid';
import { Paginator } from '~/components/paginator';
import { Input } from '~/components/ui/input';
import { getAlbums, getPagesCount } from '~/lib/server/data';

export const loader = async ({ request }: LoaderFunctionArgs) => {
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
			<div className='mt-4 grow px-2 space-y-4'>
				<Form className='max-w-md mx-auto'>
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
			<Paginator page={page} totalPages={totalPages} className='my-3' />
		</>
	);
}
