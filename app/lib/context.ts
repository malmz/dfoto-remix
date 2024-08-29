import { createContext, useContext } from 'react';
import type { getAlbum } from './server/data';

export const AlbumContext =
	createContext<Awaited<ReturnType<typeof getAlbum>>>(undefined);

export function useAlbum() {
	return useContext(AlbumContext);
}
