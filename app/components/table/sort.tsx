import type { Column } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '../ui/button';

interface Props<TData> {
	column: Column<TData>;
	children: React.ReactNode;
}
export function SortButton<TData>({ column, children }: Props<TData>) {
	return (
		<Button
			className='-ml-4'
			variant='ghost'
			onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
		>
			{children} <ArrowUpDown className='ml-2 h-4 w-4' />
		</Button>
	);
}
