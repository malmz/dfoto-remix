import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	MetaFunction,
} from 'react-router';
import { useFetcher, useLoaderData } from 'react-router';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { getParams } from 'remix-params-helper';
import { z } from 'zod';
import type { CrumbHandle } from '~/components/dynamic-breadcrum';
import { FormError, FormField, FormLabel } from '~/components/form/form';
import { FormInput } from '~/components/form/input';
import { Button } from '~/components/ui/button';
import { updateImage } from '~/lib/.server/actions';
import { ensureRole } from '~/lib/.server/auth';
import { getImage, getUsers } from '~/lib/.server/data';
import type { Route } from './+types/image';

export const meta: Route.MetaFunction = () => [{ title: '🔒DFoto - Image' }];

export const handle: CrumbHandle<typeof loader> = {
	breadcrumb: (match) => ({
		to: `/admin/${match.params.id}/${match.params.imageId}`,
		title: `Image ${match.params.imageId}`,
	}),
};

export async function loader({ params, context }: Route.LoaderArgs) {
	ensureRole(['read:album'], context);
	const imageId = Number(params.imageId);
	const { image, album } = await getImage(imageId, true);
	const users = await getUsers();
	return {
		image,
		album,
		users,
	};
}

export async function action({ request, context }: Route.ActionArgs) {
	ensureRole(['write:image'], context);
	const formData = await request.formData();
	const result = getParams(
		formData,
		z.object({
			id: z.number(),
			taken_by: z.string(),
			taken_at: z.date({ coerce: true }),
		}),
	);
	if (!result.success) {
		return result;
	}

	console.log({ data: result.data });
	const { id, ...data } = result.data;
	await updateImage(id, data);

	return { success: true } as const;
}

export default function Page() {
	const { image, users } = useLoaderData<typeof loader>();
	const fetcher = useFetcher<typeof action>();
	const error = fetcher.data?.success ? undefined : fetcher.data?.errors;

	return (
		<>
			<div className='mx-auto flex w-full max-w-prose flex-col gap-4 px-4'>
				<h1 className='text-3xl font-extrabold tracking-tight'>
					Image {image.id}
				</h1>
				<img
					src={`/api/image/${image.id}?thumbnail`}
					width='360'
					height='240'
					alt={`Image ${image.id}`}
					decoding='async'
					loading='lazy'
					className='aspect-[3/2] h-[240px] w-[360px] rounded-lg object-cover transition-transform'
				/>

				<fetcher.Form
					id='image-form'
					method='post'
					className='flex flex-col gap-4'
				>
					<input name='id' type='hidden' defaultValue={image.id} />
					<FormField>
						<FormLabel>Tagen av</FormLabel>
						<FormInput
							type='text'
							name='taken_by'
							defaultValue={String(image.taken_by)}
						/>
						{error && <FormError>{error.taken_by}</FormError>}
					</FormField>

					<FormField>
						<FormLabel>Tagen vid</FormLabel>
						<FormInput
							type='datetime-local'
							name='taken_at'
							defaultValue={format(image.taken_at, "yyyy-MM-dd'T'HH:mm")}
						/>
						{error && <FormError>{error.taken_at}</FormError>}
					</FormField>

					<div className='flex items-center justify-between'>
						<Button type='submit' name='intent' value='save'>
							{fetcher.state !== 'idle' && (
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
							)}
							Spara
						</Button>
					</div>
				</fetcher.Form>
			</div>
		</>
	);
}
