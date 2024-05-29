export class ImageError extends Error {
  type: 'legacy' | 'image';
  id: string | number;
  constructor(type: 'legacy' | 'image', id: string | number) {
    super(`Failed to fetch ${type} ${id}`);
    this.name = 'ImageError';
    this.id = id;
    this.type = type;
  }
}

export interface ImageStream {
  id: number;
  stream: ReadableStream;
  mimetype: string | null;
  size: number | null;
}

export interface ImageRecord {
  id: number;
  album_id: number;
  mimetype?: string | null;
}
