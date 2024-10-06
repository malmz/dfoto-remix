import { Link } from '@remix-run/react';
import type { ColumnDef } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Check } from 'lucide-react';
import { SortButton } from '~/components/table/sort';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import type { Image as ImageType } from '~/lib/server/schema';
import { RowActions } from './row-actions';

type ItemType = ImageType & { thumbnail: boolean };
const cb = createColumnHelper<ItemType>();

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
			/>
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
		cell: (info) => <Link to={`./${info.getValue()}`}>{info.getValue()}</Link>,
	}),

	cb.display({
		id: 'picture',
		header: 'Picture',
		cell: (info) => (
			<img
				src={`/api/image/${info.row.original.id}?thumbnail`}
				width='150'
				height='100'
				alt=''
				className='aspect-[3/2] object-cover rounded-md'
			/>
		),
		enableSorting: false,
	}),

	cb.accessor('mimetype', {
		header: (info) => <SortButton column={info.column}>Filtyp</SortButton>,
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
		cell: (info) => (info.getValue() ? <Check className='h-6 w-6' /> : null),
	}),
	cb.display({
		id: 'actions',
		cell: (info) => (
			<RowActions
				id={info.row.original.id}
				album_id={info.row.original.album_id}
			/>
		),
		enableSorting: false,
		enableHiding: false,
	}),
] satisfies ColumnDef<ItemType, any>[];
