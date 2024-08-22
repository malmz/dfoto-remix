import {
	useNavigate,
	useNavigation,
	useParams,
	useRouteLoaderData,
} from '@remix-run/react';
import { useState } from 'react';
import type { AlbumLoader } from './_main.album.$id';
import Lightbox from 'yet-another-react-lightbox';
import Inline from 'yet-another-react-lightbox/plugins/inline';
import 'yet-another-react-lightbox/styles.css';
import { Button } from '~/components/ui/button';

/* export async function loader({ params }: LoaderFunctionArgs) {
	const imageId = Number(params.imageId);
	const tags = getTags(imageId);
	const image = getImage(imageId);

	return {
		image,
		tags,
	};
} */

export default function Page() {
	const { album } = useRouteLoaderData<AlbumLoader>('routes/_main.album.$id');
	//const { image } = useLoaderData<typeof loader>();
	const params = useParams();
	const navigate = useNavigate();
	const [open, setOpen] = useState(true);

	const imageId = Number(params.imageId);
	const albumId = Number(params.id);

	const currentIndex = album?.images.findIndex(({ id }) => id === imageId) ?? 0;
	const nextId = album?.images[currentIndex + 1]?.id;
	const prevId = album?.images[currentIndex - 1]?.id;

	const slides = album.images.map(({ id }) => ({
		src: `/api/image/${id}?preview`,
	}));

	return (
		<>
			<div className='fixed inset-0 bg-black'>
				<Lightbox
					carousel={{
						finite: true,
					}}
					plugins={[Inline]}
					slides={slides}
					index={currentIndex}
				/>
			</div>
		</>
	);

	/* return (
		<>
			<div className='mx-auto my-2 flex w-full max-w-screen-lg justify-between px-2'>
				<Button asChild variant='ghost' size='sm'>
					<Link to={`/album/${albumId}`}>
						<ChevronLeft className='mr-2 h-4 w-4' />
						{albumName}
					</Link>
				</Button>
			</div>
			<div className='mx-auto my-2 max-w-screen-lg px-2'>
				<img
					src={`/api/image/${image.id}?preview`}
					width={1200}
					height={800}
					alt='fotografi'
					className='w-full object-contain rounded-md'
				/>
			</div>

			<Collapsible>
				<div className='mx-auto my-2 w-full max-w-screen-sm px-2 flex flex-col gap-3'>
					<div className='flex items-center justify-between flex-wrap'>
						<div className='flex items-center gap-2'>
							<Avatar>
								<AvatarFallback>
									{image.taken_by_name?.slice(0, 2) ?? (
										<CircleUser className='h-5 w-5' />
									)}
								</AvatarFallback>
							</Avatar>
							<span>{image.taken_by_name}</span>
						</div>
						<div className='flex items-center gap-2'>
							<span className='text-muted-foreground'>
								{format(image.taken_at, 'PPP, pp', { locale: sv })}
							</span>
							<CollapsibleTrigger asChild>
								<Button variant='ghost' size='icon' className='rounded-full'>
									<Info className='h-4 w-4' />
								</Button>
							</CollapsibleTrigger>
						</div>
					</div>

					<div className='flex flex-wrap'>
						<Await resolve={tags}>
							{(ts) =>
								ts.map((t) => (
									<Badge key={t.id} variant='secondary'>
										#{t.text}
									</Badge>
								))
							}
						</Await>
					</div>

					<CollapsibleContent>
						<div className='grid grid-cols-1 gap-2 text-sm sm:grid-cols-2'>
							<span>Fotograf</span>
							<span>{image.taken_by_name}</span>
							<span>Tagen vid</span>
							<span>{format(image.taken_at, 'PPP, pp', { locale: sv })}</span>
							<span>Format</span>
							<span>{image.mimetype}</span>
							{image.exif_data?.Image?.Make && (
								<>
									<span>Märke</span>
									<span>{image.exif_data?.Image?.Make}</span>
								</>
							)}

							{image.exif_data?.Image?.Model && (
								<>
									<span>Model</span>
									<span>{image.exif_data?.Image?.Model}</span>
								</>
							)}

							{image.exif_data?.Photo?.LensModel && (
								<>
									<span>Lins</span>
									<span>{image.exif_data?.Photo?.LensModel}</span>
								</>
							)}
						</div>
					</CollapsibleContent>
				</div>
			</Collapsible>
		</>
	); */
}
