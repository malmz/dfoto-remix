import { createReadStream } from 'node:fs';
import { createReadableStreamFromReadable } from '@remix-run/node';
import { getLegacyImageData } from '../data';
import { getLegacyPath } from './paths';
import { ImageError, type ImageRecord, type ImageStream } from './types';
import { safeStat } from './utils';

export async function getLegacyImageStream(
	image: ImageRecord,
): Promise<ImageStream> {
	const legacyData = await getLegacyImageData(image);
	if (!legacyData) throw new ImageError('legacy', 'missing');
	const res = await fetch(
		`https://dfoto.se/v1/image/${legacyData.id}/fullSize`,
	);
	if (!res.ok || !res.body) throw new ImageError('legacy', legacyData.id);

	return {
		id: image.id,
		stream: res.body,
		mimetype: image.mimetype ?? 'application/octet-stream',
		size: null,
	};
}

export async function getLocalLegacyImageStream(
	image: ImageRecord,
): Promise<ImageStream> {
	const legacyData = await getLegacyImageData(image);
	if (!legacyData) throw new ImageError('legacy', image.id);
	const path = getLegacyPath(legacyData.filepath);
	const stats = await safeStat(path);
	if (stats == null) throw new ImageError('legacy', image.id);
	const mimetype = image.mimetype ?? 'application/octet-stream';
	const stream = createReadableStreamFromReadable(createReadStream(path));
	return {
		id: image.id,
		stream,
		mimetype,
		size: stats.size,
	};
}
