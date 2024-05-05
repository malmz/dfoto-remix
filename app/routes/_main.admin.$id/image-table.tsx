import { DataTable } from '~/components/data-table';
import { Input } from '~/components/ui/input';
import { useState } from 'react';
import { createColumns } from './columns';
import { Image } from '~/lib/schema';
import { UploadButton } from './upload-button';

type Props = {
  albumId: number;
  thumbnailId: number | null;
  data: Image[];
};
export function ImageTable({ albumId, thumbnailId, data }: Props) {
  const [filter, setFilter] = useState('');
  const mappedData = data.map((image) => ({
    ...image,
    thumbnail: image.id === thumbnailId,
  }));

  return (
    <div>
      <div className='flex items-center justify-between gap-4 py-4'>
        <Input
          type='search'
          placeholder='Sök'
          value={filter ?? ''}
          onChange={(event) => setFilter(event.target.value)}
          className='max-w-sm'
        ></Input>
        <UploadButton variant='outline' size='sm' albumId={albumId}>
          Ladda upp bilder
        </UploadButton>
      </div>
      <DataTable
        filter={filter}
        onFilterChange={setFilter}
        columns={createColumns()}
        data={mappedData}
        sortDesc={true}
      ></DataTable>
    </div>
  );
}
