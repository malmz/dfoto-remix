import { stat } from 'node:fs/promises';

export async function safeStat(path: string) {
	try {
		return await stat(path);
	} catch (e) {
		return null;
	}
}
