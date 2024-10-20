import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { FormError, FormField, FormLabel } from '~/components/form/form';
import { FormInput } from '~/components/form/input';
import { ensureRole } from '~/lib/.server/auth';
import { getImage } from '~/lib/.server/data';

export const meta: MetaFunction<typeof loader> = () => [
	{ title: '🔒DFoto - Image' },
];

export async function loader({ params, context }: LoaderFunctionArgs) {
	ensureRole(['read:album'], context);
	const imageId = Number(params.imageId);
	const image = await getImage(imageId, true);
	return {
		image,
	};
}

export default function Page() {
	const { image } = useLoaderData<typeof loader>();
	const fetcher = useFetcher<any>();
	const errors = fetcher.data?.errors;
	return (
		<>
			<div>
				<h1 className='text-3xl font-extrabold tracking-tight'>
					Edit image {image}
				</h1>
				<fetcher.Form>
					<FormField>
						<FormLabel>Titel</FormLabel>
						<FormInput type='text' name='name' required />
						{errors && <FormError>{errors.name}</FormError>}
					</FormField>
				</fetcher.Form>
			</div>
		</>
	);
}
