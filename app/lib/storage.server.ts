import { createReadStream } from "fs";
import { extension } from "mime-types";
import { join } from "path";
import { Readable } from "stream";

const storagePath = process.env.STORAGE_PATH ?? "./storage/images";
//const uploadsPath = process.env.UPLOADS_PATH ?? "./storage/uploads";

export async function getImageStream(image: {
  id: number;
  album_id: number;
  mimetype?: string | null;
}): Promise<ReadableStream> {
  const ext = image.mimetype ? extension(image.mimetype) || "" : "";
  const filename = `${image.id}.${ext}`;
  const path = join(storagePath, image.album_id.toString(), filename);

  // Släng dig i väggen node streams
  // toWeb returns a node:stream/web ReadableStream
  // which is not the same as web standard ReadableStream
  // but it's close enough and works here so i dont care
  return Readable.toWeb(createReadStream(path)) as ReadableStream;
}
