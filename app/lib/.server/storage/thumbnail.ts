import { createReadStream } from 'node:fs';
import { mkdir, stat } from 'node:fs/promises';
import { dirname } from 'node:path';
import { createReadableStreamFromReadable } from '@remix-run/node';
import { ensureImage } from './image';
import { createThumbnail } from './optimizer';
import { getImagePath, getThumbnailPath } from './paths';
import { ImageError, type ImageRecord, type ImageStream } from './types';
import { safeStat } from './utils';

async function ensureThumbnail(image: ImageRecord) {
	const path = getThumbnailPath(image);
	let stats = await safeStat(path);
	if (stats != null) return stats;
	await ensureImage(image);
	const imagePath = getImagePath(image);
	mkdir(dirname(path), { recursive: true });
	await createThumbnail(imagePath, path);
	stats = await safeStat(path);
	if (stats == null) throw new ImageError('image', image.id);
	return stats;
}

export async function getThumbnailStream(
	image: ImageRecord,
	ensure = false,
): Promise<ImageStream> {
	const path = getThumbnailPath(image);
	const stats = ensure ? await ensureThumbnail(image) : await stat(path);
	const stream = createReadableStreamFromReadable(createReadStream(path));
	return {
		id: image.id,
		stream,
		mimetype: 'image/webp',
		size: stats.size,
	};
}
