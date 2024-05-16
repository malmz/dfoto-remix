import { createReadStream } from 'node:fs';
import { ImageError, type ImageRecord, type ImageStream } from './types';
import { safeStat } from './utils';
import { createReadableStreamFromReadable } from '@remix-run/node';
import { createPreview } from './optimizer';
import { stat, mkdir } from 'node:fs/promises';
import { getImagePath, getPreviewPath } from './paths';
import { ensureImage } from './image';
import { dirname } from 'node:path';

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
  ensure = false
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
