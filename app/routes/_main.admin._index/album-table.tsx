'use client';

import { DataTable } from '~/components/data-table';
import { Input } from '~/components/ui/input';
import { useState } from 'react';
import { columns } from './columns';
import type { Album } from '~/lib/schema';
import { Button } from '~/components/ui/button';
import { Link } from '@remix-run/react';

type Props = {
  data: Album[];
};
export function AlbumTable({ data }: Props) {
  const [filter, setFilter] = useState('');

  return (
    <>
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
          data={data}
          sortBy='start_at'
          sortDesc={true}
        ></DataTable>
      </div>
    </>
  );
}
