import {
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type SortingState,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import type { Image } from '~/lib/schema.server';
import { columns } from './columns';
import { fuzzyFilter } from '~/components/table/utils';
import { DataTable } from '~/components/table/table';
import { DataTablePagination } from '~/components/table/pagination';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Link } from '@remix-run/react';
import { UploadButton } from './upload-button';

interface Props {
	albumId: number;
	thumbnailId: number | null;
	data: Image[];
}
export function ImageTable({ data, thumbnailId, albumId }: Props) {
	const [filter, setFilter] = useState('');
	const [sorting, setSorting] = useState<SortingState>([
		{ id: 'taken_at' as string, desc: false },
	]);

	const mapped = useMemo(
		() =>
			data.map((image) => ({
				...image,
				thumbnail: image.id === thumbnailId,
			})),
		[data, thumbnailId],
	);

	const table = useReactTable({
		data: mapped,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onGlobalFilterChange: setFilter,
		getFilteredRowModel: getFilteredRowModel(),
		globalFilterFn: fuzzyFilter,
		filterFns: {
			fuzzy: fuzzyFilter,
		},
		state: { sorting, globalFilter: filter },
		autoResetPageIndex: false,
	});

	return (
		<div className='space-y-4'>
			<div className='flex items-center justify-between gap-4'>
				<Input
					type='search'
					placeholder='Sök'
					value={filter ?? ''}
					onChange={(event) => setFilter(event.target.value)}
					className='max-w-sm'
				/>
				{table.getFilteredSelectedRowModel().rows.length > 0 ? (
					<Button variant='destructive' size='sm'>
						Ta bort bilder
					</Button>
				) : (
					<UploadButton variant='outline' size='sm' albumId={albumId}>
						Ladda upp bilder
					</UploadButton>
				)}
			</div>
			<div className='rounded-md border'>
				<DataTable table={table} />
			</div>
			<DataTablePagination table={table} />
		</div>
	);
}
