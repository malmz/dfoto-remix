import { extension } from 'mime-types';
import { join } from 'path';

export const storagePath = process.env.STORAGE_PATH ?? './storage/images';
export const uploadsPath = process.env.UPLOADS_PATH ?? './storage/uploads';

export function getImagePath(image: {
  id: number;
  album_id: number;
  mimetype?: string | null;
}): string {
  const ext = image.mimetype ? extension(image.mimetype) || '' : '';
  const filename = `${image.id}.${ext}`;
  const path = join(storagePath, image.album_id.toString(), filename);
  return path;
}
