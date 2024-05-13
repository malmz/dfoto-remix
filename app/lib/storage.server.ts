import { extension } from 'mime-types';
import { join } from 'path';
import { mkdir, rename } from 'fs/promises';

export const storagePath = process.env.STORAGE_PATH ?? './storage';
export const imagePath = join(storagePath, 'images');
export const uploadsPath = join(storagePath, 'uploads');

export function getImagePath(image: {
  id: number;
  album_id: number;
  mimetype?: string | null;
}): string {
  const ext = image.mimetype ? extension(image.mimetype) || '' : '';
  const filename = `${image.id}.${ext}`;
  const path = join(imagePath, image.album_id.toString(), filename);
  return path;
}

export async function commitUpload(
  stagePath: string,
  image: { id: number; album_id: number; mimetype?: string | null }
) {
  const ext = image.mimetype ? extension(image.mimetype) || '' : '';
  const filename = `${image.id}.${ext}`;
  const dest = join(imagePath, image.album_id.toString(), filename);
  await mkdir(join(imagePath, image.album_id.toString()), {
    recursive: true,
  });
  await rename(stagePath, dest);
}
