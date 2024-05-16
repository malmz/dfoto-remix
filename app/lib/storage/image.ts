import {
  createReadableStreamFromReadable,
  writeReadableStreamToWritable,
} from '@remix-run/node';
import { createReadStream, createWriteStream } from 'node:fs';
import { dirname } from 'node:path';
import { ImageError, type ImageRecord, type ImageStream } from './types';
import { safeStat } from './utils';
import { getLegacyImageStream } from './legacy';
import { stat, mkdir, rename } from 'node:fs/promises';
import { createOptimized } from './optimizer';
import { getImagePath, getPreviewPath, getThumbnailPath } from './paths';

export async function ensureImage(image: ImageRecord) {
  const path = getImagePath(image);
  let stats = await safeStat(path);
  if (stats != null) return stats;
  const imageStream = await getLegacyImageStream(image);
  await mkdir(dirname(path), { recursive: true });
  await writeReadableStreamToWritable(
    imageStream.stream,
    createWriteStream(path)
  );
  stats = await safeStat(path);
  if (stats == null) throw new ImageError('image', image.id);
  return stats;
}

export async function getImageStream(
  image: ImageRecord,
  ensure = false
): Promise<ImageStream> {
  const path = getImagePath(image);
  const stats = ensure ? await ensureImage(image) : await stat(path);
  const stream = createReadableStreamFromReadable(createReadStream(path));
  return {
    id: image.id,
    stream,
    mimetype: image.mimetype ?? 'application/octet-stream',
    size: stats.size,
  };
}

export async function commitUpload(stagePath: string, image: ImageRecord) {
  const path = getImagePath(image);
  await mkdir(dirname(path), { recursive: true });
  await rename(stagePath, path);
  createOptimized(path, getThumbnailPath(image), getPreviewPath(image));
}
