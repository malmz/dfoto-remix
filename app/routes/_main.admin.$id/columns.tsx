'use client';

import { SortButton } from '~/components/data-table';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Album, Image as ImageType } from '~/lib/schema.server';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Check, Link as LinkIcon, MoreHorizontal, Trash2 } from 'lucide-react';
import { extension } from 'mime-types';
import { Link } from '@remix-run/react';

type ItemType = ImageType & { thumbnail: boolean };
const cb = createColumnHelper<ItemType>();

function RowActions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <span className='sr-only'>Öppna meny</span>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator></DropdownMenuSeparator>
        <DropdownMenuItem onClick={async () => {}}>
          <Check className='mr-2 h-4 w-4'></Check>
          <span>Sätt som omslag</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <LinkIcon className='mr-2 h-4 w-4'></LinkIcon>
          <span>Kopiera länk</span>
        </DropdownMenuItem>
        <DropdownMenuItem className='text-destructive'>
          <Trash2 className='mr-2 h-4 w-4'></Trash2>
          <span>Ta bort</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function createColumns() {
  return [
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

    cb.accessor('id', {
      header: (info) => <SortButton column={info.column}>ID</SortButton>,
      cell: (info) => <Link to={''}>{info.getValue()}</Link>,
    }),

    cb.display({
      id: 'picture',
      header: 'Picture',
      cell: (info) => (
        <Link to={''}>
          <img
            src={`/api/image/${info.row.original.id}`}
            width='150'
            height='100'
            alt=''
            className='aspect-[3/2] object-cover'
          ></img>
        </Link>
      ),
      enableSorting: false,
    }),

    cb.accessor('mimetype', {
      header: (info) => <SortButton column={info.column}>Filtyp</SortButton>,
      cell: (info) => extension(info.getValue()),
    }),
    cb.accessor('taken_at', {
      header: (info) => <SortButton column={info.column}>Tagen vid</SortButton>,
      cell: (info) => (
        <span className='text-nowrap'>
          {format(info.getValue(), 'yyyy-MM-dd')}
        </span>
      ),
    }),
    cb.accessor('taken_by_name', {
      header: (info) => <SortButton column={info.column}>Fotograf</SortButton>,
    }),
    cb.accessor('thumbnail', {
      header: 'Omslag',
      cell: (info) =>
        info.getValue() ? <Check className='h-6 w-6'></Check> : null,
    }),
    cb.display({
      id: 'actions',
      cell: (info) => <RowActions></RowActions>,
      enableSorting: false,
      enableHiding: false,
    }),
  ] satisfies ColumnDef<ItemType, any>[];
}
