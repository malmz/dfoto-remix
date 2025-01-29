import { join } from 'node:path';
import { encodeBase32LowerCaseNoPadding } from '@oslojs/encoding';

import {
	type SessionData,
	type SessionIdStorageStrategy,
	createCookie,
	createSessionStorage,
} from 'react-router';

import { createFileSessionStorage } from '@react-router/node';
import { and, eq, gt, isNull, or, sql } from 'drizzle-orm';
import { db } from './db';
import { sessionTable } from './schema';
import { storagePath } from './storage/paths';

// export the whole sessionStorage object
/*export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'session', // use any name you want here
    sameSite: 'lax', // this helps with CSRF
    path: '/', // remember to add this so the cookie will work in all routes
    httpOnly: true, // for security reasons, make this cookie http only
    secrets: [process.env.COOKIE_SECRET!], // replace this with an actual secret
    secure: process.env.NODE_ENV === 'production', // enable this in prod only
  },
}); */

export function generateIdFromEntropySize(size: number): string {
	const buffer = crypto.getRandomValues(new Uint8Array(size));
	return encodeBase32LowerCaseNoPadding(buffer);
}

const sessionDir = join(storagePath, 'sessions');

const cookie = createCookie('session', {
	sameSite: 'lax',
	path: '/',
	httpOnly: true,
	secrets: [process.env.COOKIE_SECRET!],
	secure: process.env.NODE_ENV === 'production',
});

export const sessionStorage = createSessionStorage({
	cookie,
	async createData(data, expires) {
		while (true) {
			const id = generateIdFromEntropySize(25);
			try {
				await db.insert(sessionTable).values({ id, data, expires_at: expires });
				return id;
			} catch (error) {
				console.error('error creating session', error);
			}
		}
	},
	async readData(id) {
		const [content] = await db
			.select()
			.from(sessionTable)
			.where(
				and(
					eq(sessionTable.id, id),
					or(
						gt(sessionTable.expires_at, sql`now()`),
						isNull(sessionTable.expires_at),
					),
				),
			);
		if (!content) {
			return null;
		}
		return content.data as any;
	},

	async updateData(id, data, expires) {
		await db
			.update(sessionTable)
			.set({
				data: data,
				expires_at: expires,
			})
			.where(eq(sessionTable.id, id));
	},

	async deleteData(id) {
		console.log('deleting session');
		if (!id) {
			return;
		}
		await db.delete(sessionTable).where(eq(sessionTable.id, id));
	},
});

/* export const sessionStorage = createFileSessionStorage({
	dir: sessionDir,
	cookie,
}); */

// you can also export the methods individually for your own usage
export const { getSession, commitSession, destroySession } = sessionStorage;
