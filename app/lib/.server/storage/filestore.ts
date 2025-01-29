import { db } from '../db';
import { fileTable, imageTable } from '../schema';
import { and, eq } from 'drizzle-orm';
import path from 'node:path';
import { mkdirSync, statSync } from 'node:fs';
import fsp from 'node:fs/promises';
import { openFile, writeFile } from '@mjackson/lazy-file/fs';

interface FileMetadata {
	file: string;
	name: string;
	type: string;
	mtime: Date;
}

interface MetadataIndex {
	has(key: number): Promise<boolean>;
	set(key: number, file: FileMetadata): Promise<void>;
	create(file: FileMetadata): Promise<number>;
	get(key: number): Promise<FileMetadata | null>;
	remove(key: number): Promise<void>;
}

const postgresMetadataIndex: MetadataIndex = {
	has: async (key) => {
		const res = await db
			.select({ id: fileTable.id })
			.from(fileTable)
			.where(eq(fileTable.id, key));
		return res.length === 1;
	},
	set: async (key, file) => {
		await db.update(fileTable).set(file).where(eq(fileTable.id, key));
	},
	create: async (file) => {
		const [res] = await db
			.insert(fileTable)
			.values(file)
			.returning({ id: fileTable.id });
		return res.id;
	},
	get: async (key) => {
		const [res] = await db
			.select({
				file: fileTable.file,
				name: fileTable.name,
				type: fileTable.type,
				mtime: fileTable.mtime,
			})
			.from(fileTable)
			.where(eq(fileTable.id, key));
		return res ?? null;
	},
	remove: async (key) => {
		await db.delete(fileTable).where(eq(fileTable.id, key));
	},
};

export class ImageFileStore {
	#index: MetadataIndex;
	#directory: string;
	constructor(index: MetadataIndex, directory: string) {
		this.#directory = path.resolve(directory);
		try {
			const stats = statSync(this.#directory);

			if (!stats.isDirectory()) {
				throw new Error(`Path "${this.#directory}" is not a directory`);
			}
		} catch (error) {
			if (!isNoEntityError(error)) {
				throw error;
			}

			mkdirSync(this.#directory, { recursive: true });
		}

		this.#index = index;
	}

	async create(file: File) {
    const ext = mimetype
    const id = await this.#index.create({
      file
    })
    const storedFile = await storeFile(this.#directory, file);
  }
}

async function storeFile(dirname: string, file: File): Promise<string> {
  let filename: string;
  let handle: fsp.FileHandle;
  while (true) {
    try {
      filename = randomFilename()
      handle = await fsp.open(path.join(dirname, filename), 'w');
      break;
    } catch (error) {
      if (!((error as NodeJS.ErrnoException).code === 'EEXIST')) {
        throw error;
      }
    }
  }

	await writeFile(handle, file);

	return filename;
}

function randomFilename(): string {
	return `${new Date().getTime().toString(36)}.${Math.random().toString(36).slice(2, 6)}`;
}

function isNoEntityError(
	obj: unknown,
): obj is NodeJS.ErrnoException & { code: 'ENOENT' } {
	return (
		obj instanceof Error &&
		'code' in obj &&
		(obj as NodeJS.ErrnoException).code === 'ENOENT'
	);
}
