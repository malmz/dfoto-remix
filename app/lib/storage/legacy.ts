import { ImageError, type ImageRecord, type ImageStream } from './types';

export async function getLegacyImageStream(
  image: ImageRecord
): Promise<ImageStream> {
  const id = image.legacy_id;
  if (!id) throw new ImageError('legacy', 'missing');
  const res = await fetch(
    `https://dfoto.se/v1/image/${image.legacy_id}/fullSize`
  );
  if (!res.ok || !res.body) throw new ImageError('legacy', id);
  return {
    id: image.id,
    stream: res.body,
    mimetype: image.mimetype ?? 'application/octet-stream',
    size: null,
  };
}
