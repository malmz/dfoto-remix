import {
	Link,
	useNavigate,
	useNavigation,
	useParams,
	useRouteLoaderData,
} from '@remix-run/react';
import { useCallback, useMemo, useState } from 'react';
import type { AlbumLoader } from './_main.album.$id';
import Lightbox from 'yet-another-react-lightbox';
import Inline from 'yet-another-react-lightbox/plugins/inline';
import 'yet-another-react-lightbox/styles.css';
import { Button } from '~/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
	return Math.abs(offset) * velocity;
};

const variants = {
	enter: (direction: number) => {
		return {
			x: direction > 0 ? 1000 : -1000,
			opacity: 0,
		};
	},
	center: {
		zIndex: 1,
		x: 0,
		opacity: 1,
	},
	exit: (direction: number) => {
		return {
			zIndex: 0,
			x: direction < 0 ? 1000 : -1000,
			opacity: 0,
		};
	},
};

const loadingVariants = {
	show: {
		opacity: 1,
		display: 'grid',
	},
	hide: {
		opacity: 0,
		transitionEnd: {
			display: 'none',
		},
	},
};

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
	const { album } = useRouteLoaderData<AlbumLoader>('routes/_main.album.$id')!;
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
	const navigate = useNavigate();

	const navigation = useNavigation();
	const [direction, setDirection] = useState(0);

	const imageId = Number(params.imageId);
	const albumId = Number(params.id);

	const { next, prev } = imageMap.get(imageId)!;

	const paginate = useCallback(
		(newDirection: number) => {
			const toId = newDirection === 1 ? next : prev;
			if (toId != null) {
				setDirection(newDirection);
				navigate(`/album/${albumId}/${toId}`);
			}
		},
		[next, prev, albumId, navigate],
	);

	return (
		<>
			<div className='fixed inset-0 bg-black'>
				<AnimatePresence initial={false} custom={direction}>
					<motion.img
						key={imageId}
						src={`/api/image/${imageId}?preview`}
						className='object-contain absolute w-full h-full'
						variants={variants}
						custom={direction}
						initial='enter'
						animate={navigation.state === 'loading' ? 'exit' : 'center'}
						exit='exit'
						transition={{
							x: { type: 'spring', stiffness: 300, damping: 30 },
							opacity: { duration: 0.2 },
						}}
						drag='x'
						dragConstraints={{ left: 0, right: 0 }}
						dragElastic={1}
						onDragEnd={(e, { offset, velocity }) => {
							const swipe = swipePower(offset.x, velocity.x);
							if (swipe < -swipeConfidenceThreshold) {
								paginate(1);
							} else if (swipe > swipeConfidenceThreshold) {
								paginate(-1);
							}
						}}
					/>
				</AnimatePresence>
				<motion.div
					key='spinner'
					className='absolute inset-0 grid place-content-center'
					variants={loadingVariants}
					initial='hide'
					animate={navigation.state === 'loading' ? 'show' : 'hide'}
					transition={{
						delay: 0.3,
					}}
				>
					<Loader2 className='animate-spin w-24 h-24 text-muted-foreground' />
				</motion.div>
				{next && (
					<Button asChild>
						<Link to={`/album/${albumId}/${next}`} prefetch='render'>
							Next
						</Link>
					</Button>
				)}
				{prev && (
					<Button asChild>
						<Link to={`/album/${albumId}/${prev}`} prefetch='render'>
							Previous
						</Link>
					</Button>
				)}
			</div>
		</>
	);

	/* return (
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
	); */

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
