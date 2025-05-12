import { db } from '~/lib/.server/db';
import type { Route } from './+types/gallery';
import { legacyAlbum } from '~/lib/.server/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'react-router';
import { assertResponse } from '~/lib/utils';

export async function loader({ params }: Route.LoaderArgs) {
	const [album] = await db
		.select({ albumId: legacyAlbum.album_id })
		.from(legacyAlbum)
		.where(eq(legacyAlbum.id, params.albumId));
	assertResponse(album, 'Legacy album not found', { status: 404 });
	throw redirect(`/${album.albumId}`);
}
