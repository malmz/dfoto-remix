import { Link } from '@remix-run/react';
import { format } from 'date-fns';

type Props = {
  album: {
    id: number;
    name: string;
    start_at: Date;
    legacy_id: string | null;
    thumbnail_id: number | null;
  };
};

export function Album({ album }: Props) {
  return (
    <Link key={album.id} to={`/album/${album.id}`} className='space-y-2'>
      <div className='overflow-hidden rounded-lg'>
        <img
          src={`/api/image/${album.thumbnail_id}?thumbnail`}
          width='300'
          height='200'
          alt={album.name}
          decoding='async'
          loading='lazy'
          className='aspect-[3/2] h-[200px] w-[300px] object-cover transition-transform hover:scale-105'
        ></img>
      </div>
      <div className='flex flex-wrap justify-between px-2 text-sm'>
        <span className='font-medium leading-none'>{album.name}</span>
        <span className='text-xs text-muted-foreground'>
          {format(album.start_at, 'yyyy-MM-dd')}
        </span>
      </div>
    </Link>
  );
}
