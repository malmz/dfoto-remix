import { useLoaderData } from '@remix-run/react';
import { getAllAlbums } from '~/lib/data.server';
import { AlbumTable } from './album-table';

export async function loader() {
  const albums = await getAllAlbums();
  return { albums };
}

export default function Admin() {
  const { albums } = useLoaderData<typeof loader>();
  return (
    <div className='container mt-8 flex flex-col gap-4'>
      <h1 className='text-3xl font-extrabold tracking-tight'>Album</h1>
      <AlbumTable data={albums}></AlbumTable>
    </div>
  );
}
