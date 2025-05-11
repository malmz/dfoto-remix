import { extension } from 'mime-types';
import { extname, join } from 'node:path';
import { FileHandle, open } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';

export class FileStore {
	storagePath: string;

	constructor(path: string) {
		this.storagePath = path;
	}

	async storeUpload(file: File): string {
		while (true) {
			let filename: string;
			let handle: FileHandle;
			try {
				filename = generateFilename(file.name);
				handle = await open(join(this.storagePath, 'uploads', filename), '');
			} catch (error) {}
		}
	}

	getPath(
		type: string,
		group: string | number,
		name: string | number,
		extension: string,
	): string {
		return join(
			this.storagePath,
			type,
			group.toString(),
			`${name}.${extension}`,
		);
	}

	imagePath(image: {
		id: number;
		album_id: number;
		mimetype?: string | null;
	}): string {
		const ext = image.mimetype ? extension(image.mimetype) || '' : '';
		return this.getPath('images', image.album_id, image.id, ext);
	}

	thumbnailPath(image: { id: number; album_id: number }): string {
		return this.getPath('thumbnails', image.album_id, image.id, 'webp');
	}

	previewPath(image: { id: number; album_id: number }): string {
		return this.getPath('previews', image.album_id, image.id, 'webp');
	}
}

function generateFilename(filename: string) {
	const ext = filename ? extname(filename) : '';
	return 'upload_' + randomBytes(4).readUInt32LE(0) + ext;
}
