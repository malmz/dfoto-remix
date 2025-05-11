import { Link } from 'react-router';
import { format } from 'date-fns';

type Props = {
	album: {
		id: number;
		name: string;
		start_at: Date;
		thumbnail_id: number | null;
	};
};

export function Album({ album }: Props) {
	return (
		<Link key={album.id} to={`/album/${album.id}`} className='space-y-2'>
			<div className='overflow-hidden rounded-lg'>
				<img
					src={`/api/image/${album.thumbnail_id}?thumbnail`}
					width='360'
					height='240'
					alt={album.name}
					decoding='async'
					loading='lazy'
					className='aspect-[3/2] h-[240px] w-[360px] object-cover transition-transform hover:scale-105'
				/>
			</div>
			<div className='flex flex-col flex-wrap justify-between px-2 text-sm'>
				<span className='text-xl leading-none font-medium'>{album.name}</span>
				<span className='text-md text-muted-foreground'>
					{format(album.start_at, 'yyyy-MM-dd')}
				</span>
			</div>
		</Link>
	);
}
