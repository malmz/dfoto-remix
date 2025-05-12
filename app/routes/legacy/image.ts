import { redirect } from 'react-router';
import type { Route } from './+types/image';
import { db } from '~/lib/.server/db';
import { legacyAlbum, legacyImage } from '~/lib/.server/schema';
import { eq } from 'drizzle-orm';
import { assertResponse } from '~/lib/utils';

export async function loader({ params }: Route.LoaderArgs) {
	const [album] = await db
		.select({ albumId: legacyAlbum.album_id })
		.from(legacyAlbum)
		.where(eq(legacyAlbum.id, params.albumId));
	const [image] = await db
		.select({ imageId: legacyImage.image_id })
		.from(legacyImage)
		.where(eq(legacyImage.id, params.imageId));
	assertResponse(album && image, 'Legacy image not found', { status: 404 });
	throw redirect(`/${album.albumId}/${image.imageId}`);
}
