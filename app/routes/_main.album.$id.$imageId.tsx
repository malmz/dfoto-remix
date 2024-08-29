import { Link, useParams } from '@remix-run/react';
import { useMemo } from 'react';
import 'yet-another-react-lightbox/styles.css';
import { Button } from '~/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAlbum } from '~/lib/context';

/* export const loader = defineLoader(({ params }) => {
	const imageId = Number(params.imageId);
	const tags = getTags(imageId);
	const image = getImage(imageId);

	return {
		image,
		tags,
	};
}); */

export default function Page() {
	const album = useAlbum()!;
	const imageMap = useMemo(
		() =>
			new Map(
				album.images.map((image, i) => [
					image.id,
					{
						image,
						next: album.images[i + 1]?.id,
						prev: album.images[i - 1]?.id,
					},
				]),
			),
		[album],
	);
	//const { image } = useLoaderData<typeof loader>();
	const params = useParams();
	const imageId = Number(params.imageId);
	const albumId = Number(params.id);

	const { next, prev } = imageMap.get(imageId)!;

	return (
		<>
			<div className='grow grid place-content-center px-2 md:px-20 pb-20 md:pb-4 pt-4 relative'>
				{prev && (
					<Button
						variant='secondary'
						size='icon'
						className='rounded-full z-10 absolute bottom-6 left-1/3 md:top-1/2 md:left-4'
						asChild
					>
						<Link to={`/album/${albumId}/${prev}`} prefetch='render'>
							<ChevronLeft className='w-4 h-4' />
						</Link>
					</Button>
				)}
				{next && (
					<Button
						variant='secondary'
						size='icon'
						className='rounded-full z-10 absolute bottom-6 right-1/3 md:top-1/2 md:right-4'
						asChild
					>
						<Link to={`/album/${albumId}/${next}`} prefetch='render'>
							<ChevronRight className='w-4 h-4' />
						</Link>
					</Button>
				)}

				<img
					src={`/api/image/${imageId}?preview`}
					alt='photograph'
					className='object-contain rounded'
				/>
			</div>
		</>
	);
}
