import { extension } from 'mime-types';
import { checkRole } from '~/lib/.server/auth';
import { getImage } from '~/lib/.server/data';
import { getImageStream } from '~/lib/.server/storage/image';
import { getPreviewStream } from '~/lib/.server/storage/preview';
import { getThumbnailStream } from '~/lib/.server/storage/thumbnail';
import type { ImageStream } from '~/lib/.server/storage/types';
import { assertResponse } from '~/lib/utils';
import type { Route } from './+types/image';
import { getSearchParams } from 'remix-params-helper';
import { z } from 'zod';
import { filestore } from '~/lib/.server/storage/filestore';

const ensure = true;

export const loader = async ({
	params,
	request,
	context,
}: Route.LoaderArgs) => {
	const { passed } = checkRole(['read:album'], context);

	const id = Number(params.id);
	assertResponse(!Number.isNaN(id), 'Invalid image id');

	const query = new URL(request.url).searchParams;
	const thumbnail = query.get('thumbnail') != null;
	const preview = query.get('preview') != null;
	assertResponse(!(thumbnail && preview), 'Invalid query parameters');

	const data = await getImage(id, passed);
	assertResponse(data, 'Image not found', { status: 404 });
	const ext = extension(data.mimetype) || '';

	let imageStream: ImageStream;
	try {
		if (thumbnail) {
			imageStream = await filestore.thumbnailStream(data);
		} else if (preview) {
			imageStream = await filestore.previewStream(data);
		} else {
			imageStream = await filestore.imageStream(data);
		}
	} catch (error) {
		return new Response('Image file not found', { status: 404 });
	}

	return new Response(imageStream.stream, {
		headers: {
			'Content-Type': imageStream.mimetype,
			'Content-Length': imageStream.size?.toString() ?? '',
			'Content-Disposition': `inline; filename="${data.album_name}-${data.id}.${ext}"`,
			'Cache-Control': 'public, max-age=604800, immutable',
		},
	});
};
