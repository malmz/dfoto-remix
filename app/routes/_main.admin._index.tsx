import { Link, useLoaderData } from '@remix-run/react';
import { getAllAlbums } from '~/lib/data.server';
import { ensureRole } from '~/lib/auth.server';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { Input } from '~/components/ui/input';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { DataTable, SortButton } from '~/components/data-table';
import { Badge } from '~/components/ui/badge';
import type { Album } from '~/lib/schema.server';
import type { ColumnDef } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';

const cb = createColumnHelper<Album>();

export const columns = [
  cb.accessor('name', {
    header: 'Namn',
    cell: (info) => (
      <Link
        className='font-medium underline underline-offset-4'
        to={`/admin/${info.row.original.id}`}
      >
        {info.getValue()}
      </Link>
    ),
  }),
  cb.accessor('description', {
    header: 'Beskrivning',
  }),
  cb.accessor('published', {
    header: ({ column }) => <SortButton column={column}>Status</SortButton>,
    cell: (info) =>
      info.getValue() ? (
        <Badge variant='secondary'>Published</Badge>
      ) : (
        <Badge variant='outline'>Draft</Badge>
      ),
  }),
  cb.accessor('start_at', {
    header: ({ column }) => <SortButton column={column}>Datum</SortButton>,
    cell: (info) => (
      <span className='text-nowrap'>
        {format(info.getValue(), 'yyyy-MM-dd')}
      </span>
    ),
  }),
] satisfies ColumnDef<Album, any>[];

export async function loader({ request }: LoaderFunctionArgs) {
  await ensureRole(['read:album'])(request);
  const albums = await getAllAlbums();
  return { albums };
}

export default function Admin() {
  const { albums } = useLoaderData<typeof loader>();
  const [filter, setFilter] = useState('');
  return (
    <div className='container mt-4 flex flex-col gap-4'>
      <h1 className='text-3xl font-extrabold tracking-tight'>Album</h1>
      <div>
        <div className='flex items-center justify-between gap-4 py-4'>
          <Input
            type='search'
            placeholder='Sök'
            value={filter ?? ''}
            onChange={(event) => setFilter(event.target.value)}
            className='max-w-sm'
          ></Input>
          <Button variant='outline' size='sm'>
            <Link to='/admin/create'>Skapa nytt album</Link>
          </Button>
        </div>
        <DataTable
          filter={filter}
          onFilterChange={setFilter}
          columns={columns}
          data={albums}
          sortBy='start_at'
          sortDesc={true}
        ></DataTable>
      </div>
    </div>
  );
}
