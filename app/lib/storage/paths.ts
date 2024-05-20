import { extension } from 'mime-types';
import { join } from 'node:path';

export const storagePath = process.env.STORAGE_PATH ?? './storage';
export const imagePath = join(storagePath, 'images');
export const thumbnailPath = join(storagePath, 'thumbnails');
export const previewPath = join(storagePath, 'previews');
export const legacyPath = join(storagePath, 'legacy');
export const uploadsPath = join(storagePath, 'uploads');

export function getImagePath(image: {
  id: number;
  album_id: number;
  mimetype?: string | null;
}): string {
  const ext = image.mimetype ? extension(image.mimetype) || '' : '';
  return join(imagePath, image.album_id.toString(), `${image.id}.${ext}`);
}

export function getThumbnailPath(image: {
  id: number;
  album_id: number;
}): string {
  return join(thumbnailPath, image.album_id.toString(), `${image.id}.webp`);
}

export function getPreviewPath(image: {
  id: number;
  album_id: number;
}): string {
  return join(previewPath, image.album_id.toString(), `${image.id}.webp`);
}
