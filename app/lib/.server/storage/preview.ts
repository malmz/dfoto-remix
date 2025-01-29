import { createReadStream } from 'node:fs';
import { mkdir, stat } from 'node:fs/promises';
import { dirname } from 'node:path';
import { createReadableStreamFromReadable } from '@react-router/node';
import { ensureImage } from './image';
import { createPreview } from './optimizer';
import { getImagePath, getPreviewPath } from './paths';
import { ImageError, type ImageRecord, type ImageStream } from './types';
import { safeStat } from './utils';

async function ensurePreview(image: ImageRecord) {
	const path = getPreviewPath(image);
	let stats = await safeStat(path);
	if (stats != null) return stats;
	await ensureImage(image);
	const imagePath = getImagePath(image);
	mkdir(dirname(path), { recursive: true });
	await createPreview(imagePath, path);
	stats = await safeStat(path);
	if (stats == null) throw new ImageError('image', image.id);
	return stats;
}

export async function getPreviewStream(
	image: ImageRecord,
	ensure = false,
): Promise<ImageStream> {
	const path = getPreviewPath(image);
	const stats = ensure ? await ensurePreview(image) : await stat(path);
	const stream = createReadableStreamFromReadable(createReadStream(path));
	return {
		id: image.id,
		stream,
		mimetype: 'image/webp',
		size: stats.size,
	};
}
