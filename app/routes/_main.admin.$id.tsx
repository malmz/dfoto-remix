import type { LoaderFunctionArgs } from 'react-router';
import type { CrumbHandle } from '~/components/dynamic-breadcrum';
import { ensureRole } from '~/lib/.server/auth';
import { getAlbumName } from '~/lib/.server/data';

export async function loader({ params, context }: LoaderFunctionArgs) {
	ensureRole(['read:album'], context);
	const album = await getAlbumName(Number(params.id));
	return { album };
}

export const handle: CrumbHandle<typeof loader> = {
	breadcrumb: (match) => ({
		to: `/admin/${match.data.album.id}`,
		title: match.data.album.name,
	}),
};
