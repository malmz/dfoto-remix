import type { LoaderFunctionArgs } from '@remix-run/node';
import { Await, Form, redirect, useLoaderData } from '@remix-run/react';
import { Suspense } from 'react';
import { Album } from '~/components/album';
import { AutoGrid } from '~/components/autogrid';
import { Paginator } from '~/components/paginator';
import { Input } from '~/components/ui/input';
import { getAlbums, getPagesCount } from '~/lib/data.server';

export const loader = async ({ params }: LoaderFunctionArgs) => {
  if (params.page === '1') throw redirect('/');
  const page = Math.max(params.page ? parseInt(params.page) : 1, 1);
  const albums = getAlbums(page - 1, 28);
  const totalPages = await getPagesCount(28);
  return {
    page,
    totalPages,
    albums,
  };
};

export default function Page() {
  const { totalPages, albums } = useLoaderData<typeof loader>();

  return (
    <>
      <div className='mt-4 grow px-2 space-y-4'>
        <Form className='max-w-md mx-auto'>
          <Input type='search' placeholder='Sök...' name='q'></Input>
        </Form>
        <Suspense fallback={<div>Loading...</div>}>
          <AutoGrid>
            <Await resolve={albums}>
              {(albums) =>
                albums.map((album) => (
                  <Album key={album.id} album={album}></Album>
                ))
              }
            </Await>
          </AutoGrid>
        </Suspense>
      </div>
      <Paginator page={1} totalPages={totalPages} className='mt-3' />
    </>
  );
}
