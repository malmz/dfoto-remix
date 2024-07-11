import { Link } from '@remix-run/react';
import {
	type SortingState,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';
import { DataTablePagination } from '~/components/table/pagination';
import { DataTable } from '~/components/table/table';
import { fuzzyFilter } from '~/components/table/utils';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import type { Album } from '~/lib/server/schema';
import { columns } from './columns';

interface Props {
	data: Album[];
}
export function AlbumTable({ data }: Props) {
	const [filter, setFilter] = useState('');
	const [sorting, setSorting] = useState<SortingState>([
		{ id: 'start_at' as string, desc: true },
	]);

	const table = useReactTable({
		data,
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
					<Button variant='outline' size='sm'>
						<Link to='/admin/create'>Skapa nytt album</Link>
					</Button>
				)}
			</div>
			<div className='rounded-md border'>
				<DataTable table={table} />
			</div>
			<DataTablePagination table={table} />
		</div>
	);
}
