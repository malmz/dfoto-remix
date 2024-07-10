import { unstable_defineLoader as defineLoader } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';

export const loader = defineLoader(async ({ params }) => {
	return {
		imageId: params.imageId,
	};
});

export default function Page() {
	const { imageId } = useLoaderData<typeof loader>();
	const fetcher = useFetcher<any>();
	return (
		<>
			<div>
				<h1 className='text-3xl font-extrabold tracking-tight'>
					Edit image {imageId}
				</h1>
				<fetcher.Form></fetcher.Form>
			</div>
		</>
	);
}
