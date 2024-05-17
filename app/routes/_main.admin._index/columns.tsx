import { Badge } from '~/components/ui/badge';
import type { Album } from '~/lib/schema.server';
import type { ColumnDef } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Link } from '@remix-run/react';
import { SortButton } from '~/components/data-table';
import { RowActions } from './row-actions';
import { Checkbox } from '~/components/ui/checkbox';

const cb = createColumnHelper<Album>();

export const columns = [
  cb.display({
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      ></Checkbox>
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  }),

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
  cb.display({
    id: 'actions',
    cell: (info) => (
      <RowActions
        id={info.row.original.id}
        published={info.row.original.published}
      ></RowActions>
    ),
    enableSorting: false,
    enableHiding: false,
  }),
] satisfies ColumnDef<Album, any>[];
