import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from './ui/pagination';

interface Props extends React.ComponentProps<typeof Pagination> {
	page: number;
	totalPages: number;
}
export function Paginator({ page, totalPages, ...props }: Props) {
	const left = Math.max(page - 1, 2);
	const right = Math.min(page + 1, totalPages - 1);
	const middle = Math.min(Math.max(page, 3), totalPages - 2);

	return (
		<Pagination {...props}>
			<PaginationContent>
				{page > 1 ? (
					<PaginationItem>
						<PaginationPrevious to={page === 2 ? '/' : `/?page=${page - 1}`} />
					</PaginationItem>
				) : null}
				<PaginationItem>
					<PaginationLink to='/' isActive={page === 1}>
						1
					</PaginationLink>
				</PaginationItem>
				{page >= 4 ? (
					<PaginationItem>
						<PaginationEllipsis />
					</PaginationItem>
				) : null}
				{page <= totalPages - 2 ? (
					<PaginationItem>
						<PaginationLink to={`/?page=${left}`} isActive={page === left}>
							{left}
						</PaginationLink>
					</PaginationItem>
				) : null}
				{totalPages > 2 ? (
					<PaginationItem>
						<PaginationLink to={`/?page=${middle}`} isActive={page === middle}>
							{middle}
						</PaginationLink>
					</PaginationItem>
				) : null}
				{page >= 3 ? (
					<PaginationItem>
						<PaginationLink to={`/?page=${right}`} isActive={page === right}>
							{right}
						</PaginationLink>
					</PaginationItem>
				) : null}
				{page <= totalPages - 3 ? (
					<PaginationItem>
						<PaginationEllipsis />
					</PaginationItem>
				) : null}
				{totalPages > 1 ? (
					<PaginationItem>
						<PaginationLink
							to={`/?page=${totalPages}`}
							isActive={page === totalPages}
						>
							{totalPages}
						</PaginationLink>
					</PaginationItem>
				) : null}
				{page < totalPages ? (
					<PaginationItem>
						<PaginationNext to={`/?page=${page + 1}`} />
					</PaginationItem>
				) : null}
			</PaginationContent>
		</Pagination>
	);
}
