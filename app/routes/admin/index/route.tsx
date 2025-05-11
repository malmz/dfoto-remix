import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { useLoaderData } from 'react-router';
import { getParams } from 'remix-params-helper';
import { z } from 'zod';
import { deleteAlbum, setPubishedStatus } from '~/lib/.server/actions';
import { ensureRole } from '~/lib/.server/auth';
import { getAllAlbums } from '~/lib/.server/data';
import { AlbumTable } from './table';
import type { Route } from './+types/route';

export async function action({ request, context }: Route.ActionArgs) {
	const formData = await request.formData();
	switch (formData.get('intent')) {
		case 'publish': {
			ensureRole(['publish:album'], context);
			const result = getParams(
				formData,
				z.object({
					id: z.number(),
					published: z.boolean(),
				}),
			);
			if (!result.success) {
				return result;
			}

			await setPubishedStatus(result.data.id, !result.data.published);

			return { success: true } as const;
		}
		case 'delete': {
			ensureRole(['delete:album'], context);
			const result = getParams(
				formData,
				z.object({
					id: z.number(),
				}),
			);
			if (!result.success) {
				return result;
			}

			await deleteAlbum(result.data.id);
			return { success: true } as const;
		}
		default:
			throw new Error(`Invalid intent: ${formData.get('intent')}`);
	}
}

export async function loader({ request, context }: Route.LoaderArgs) {
	ensureRole(['read:album'], context);
	const albums = await getAllAlbums();
	return { albums };
}

export default function Admin() {
	const { albums } = useLoaderData<typeof loader>();
	return (
		<div className='container flex flex-col gap-4'>
			<h1 className='text-3xl font-extrabold tracking-tight'>Album</h1>
			<AlbumTable data={albums} />
		</div>
	);
}
