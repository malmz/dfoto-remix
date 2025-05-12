import { extension } from 'mime-types';
import { dirname, extname, join } from 'node:path';
import { type FileHandle, mkdir, open, rename } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { Readable, Writable } from 'node:stream';
import { createReadStream, createWriteStream } from 'node:fs';
import type { ImageRecord, ImageStream } from './types';
import { createOptimized, createPreview, createThumbnail } from './optimizer';
import { safeStat } from './utils';
import { createReadableStreamFromReadable } from '@react-router/node';

export class FileStore {
	#storagePath: string;
	#ensure: boolean;

	constructor(path: string, ensure?: boolean) {
		this.#storagePath = path;
		this.#ensure = Boolean(ensure);
	}

	async stageUpload(file: File): Promise<string> {
		for (let i = 0; i < 10; i++) {
			try {
				const filename = generateFilename(file.name);
				const ws = Writable.toWeb(
					createWriteStream(join(this.#storagePath, 'uploads', filename), {
						flags: 'wx',
					}),
				);
				await file.stream().pipeTo(ws);
				return filename;
			} catch (error) {
				console.error('retrying upload', error);
			}
		}
		throw new Error('Could not store uploadfile after multiple tries');
	}

	async commitUpload(stagedFile: string, image: ImageRecord) {
		const imagePath = this.imagePath(image);
		await mkdir(dirname(imagePath), { recursive: true });
		await rename(join(this.#storagePath, 'uploads', stagedFile), imagePath);
	}

	async generateOptimized(image: ImageRecord) {
		const imagePath = this.imagePath(image);
		const thumbnailPath = this.thumbnailPath(image);
		const previewPath = this.previewPath(image);
		await mkdir(dirname(thumbnailPath), { recursive: true });
		await mkdir(dirname(previewPath), { recursive: true });
		await createOptimized(
			imagePath,
			this.thumbnailPath(image),
			this.previewPath(image),
		);
	}

	async thumbnailStream(image: ImageRecord): Promise<ImageStream> {
		const path = this.thumbnailPath(image);
		let stream: ReadableStream;
		try {
			stream = createReadableStreamFromReadable(createReadStream(path));
		} catch {
			if (this.#ensure) {
				const imagePath = this.imagePath(image);
				await mkdir(dirname(path), { recursive: true });
				await createThumbnail(imagePath, path);
				stream = createReadableStreamFromReadable(createReadStream(path));
			} else {
				throw new Response('Image thumbnail not found', { status: 404 });
			}
		}
		const stats = (await safeStat(path))!;

		return {
			id: image.id,
			stream,
			mimetype: 'image/webp',
			size: stats.size,
		};
	}

	async previewStream(image: ImageRecord): Promise<ImageStream> {
		const path = this.previewPath(image);
		let stream: ReadableStream;
		try {
			stream = createReadableStreamFromReadable(createReadStream(path));
		} catch {
			if (this.#ensure) {
				const imagePath = this.imagePath(image);
				await mkdir(dirname(path), { recursive: true });
				await createPreview(imagePath, path);
				stream = createReadableStreamFromReadable(createReadStream(path));
			} else {
				throw new Response('Image preview not found', { status: 404 });
			}
		}
		const stats = (await safeStat(path))!;

		return {
			id: image.id,
			stream,
			mimetype: 'image/webp',
			size: stats.size,
		};
	}

	async imageStream(image: ImageRecord): Promise<ImageStream> {
		const path = this.imagePath(image);
		let stream: ReadableStream;
		try {
			stream = createReadableStreamFromReadable(createReadStream(path));
		} catch {
			throw new Response('Image not found', { status: 404 });
		}
		const stats = (await safeStat(path))!;

		return {
			id: image.id,
			stream,
			mimetype: image.mimetype ?? 'application/octet-stream',
			size: stats.size,
		};
	}

	getPath(
		type: string,
		group: string | number,
		name: string | number,
		extension: string,
	): string {
		return join(
			this.#storagePath,
			type,
			group.toString(),
			`${name}.${extension}`,
		);
	}

	imagePath(image: ImageRecord): string {
		const ext = image.mimetype ? extension(image.mimetype) || '' : '';
		return this.getPath('images', image.album_id, image.id, ext);
	}

	thumbnailPath(image: ImageRecord): string {
		return this.getPath('thumbnails', image.album_id, image.id, 'webp');
	}

	previewPath(image: ImageRecord): string {
		return this.getPath('previews', image.album_id, image.id, 'webp');
	}
}

function generateFilename(filename: string) {
	const ext = filename ? extname(filename) : '';
	return 'upload_' + randomBytes(4).readUInt32LE(0) + ext;
}

export const storagePath = process.env.STORAGE_PATH ?? './storage';
const generateThumbs = Boolean(process.env.GENERATE_THUMBS);
export const filestore = new FileStore(storagePath, generateThumbs);
