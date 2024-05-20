import {
  createReadableStreamFromReadable,
  writeReadableStreamToWritable,
} from '@remix-run/node';
import { createReadStream, createWriteStream } from 'node:fs';
import { dirname, join } from 'node:path';
import { ImageError, type ImageRecord, type ImageStream } from './types';
import { safeStat } from './utils';
import { getLegacyImageStream } from './legacy';
import { stat, mkdir, rename, rm } from 'node:fs/promises';
import { createOptimized } from './optimizer';
import {
  getImagePath,
  getPreviewPath,
  getThumbnailPath,
  imagePath,
  previewPath,
  thumbnailPath,
} from './paths';

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
  const imagePath = getImagePath(image);
  const thumbnailPath = getThumbnailPath(image);
  const previewPath = getPreviewPath(image);
  await mkdir(dirname(imagePath), { recursive: true });
  await rename(stagePath, imagePath);
  mkdir(dirname(thumbnailPath), { recursive: true });
  mkdir(dirname(previewPath), { recursive: true });
  createOptimized(imagePath, getThumbnailPath(image), getPreviewPath(image));
}

export async function deleteImageFiles(image: ImageRecord) {
  const imagePath = getImagePath(image);
  const thumbnailPath = getThumbnailPath(image);
  const previewPath = getPreviewPath(image);
  await Promise.all(
    [imagePath, thumbnailPath, previewPath].map((path) =>
      rm(path, { force: true })
    )
  );
}

export async function deleteAlbumFiles(albumId: number) {
  const albumImagePath = join(imagePath, albumId.toString());
  const albumThumbnailPath = join(thumbnailPath, albumId.toString());
  const albumPreviewPath = join(previewPath, albumId.toString());

  await Promise.all(
    [albumImagePath, albumThumbnailPath, albumPreviewPath].map((path) =>
      rm(path, { force: true, recursive: true })
    )
  );
}
