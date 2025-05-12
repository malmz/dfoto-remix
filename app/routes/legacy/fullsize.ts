import { redirect } from 'react-router';
import type { Route } from './+types/image';
import { db } from '~/lib/.server/db';
import { legacyImage } from '~/lib/.server/schema';
import { eq } from 'drizzle-orm';
import { assertResponse } from '~/lib/utils';

export async function loader({ params }: Route.LoaderArgs) {
	const [image] = await db
		.select({ imageId: legacyImage.image_id })
		.from(legacyImage)
		.where(eq(legacyImage.id, params.imageId));
	assertResponse(image, 'Legacy image not found', { status: 404 });
	throw redirect(`/api/image/${image.imageId}`);
}
