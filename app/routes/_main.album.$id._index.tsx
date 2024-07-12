import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { AutoGrid } from '~/components/autogrid';
import { getAlbum } from '~/lib/server/data';

export const meta: MetaFunction<typeof loader> = ({ data }) => [
	{ title: data ? `DFoto - ${data.album.name}` : undefined },
];

export async function loader({ params }: LoaderFunctionArgs) {
	const album = await getAlbum(Number(params.id));

	if (!album) throw new Response('Not found', { status: 404 });

	return { album };
}

export default function Page() {
	const { album } = useLoaderData<typeof loader>();

	return (
		<div className='mt-8'>
			<div className='mx-auto mb-8 w-full max-w-6xl px-4'>
				<h1 className='text-4xl font-extrabold tracking-tight lg:text-5xl'>
					{album.name}
				</h1>
				<p>{album.description}</p>
			</div>
			<AutoGrid className='mt-4 px-2'>
				{album.images.map((image) => (
					<Link
						to={`/album/${album.id}/${image.id}`}
						key={image.id}
						className='overflow-hidden rounded-lg'
					>
						<img
							src={`/api/image/${image.id}?thumbnail`}
							width='300'
							height='200'
							alt=''
							decoding='async'
							loading='lazy'
							className='aspect-[3/2] object-cover transition-transform hover:scale-105'
						/>
					</Link>
				))}
			</AutoGrid>
		</div>
	);
}
