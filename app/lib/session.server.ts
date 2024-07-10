import { join } from 'node:path';
import { createCookie, createFileSessionStorage } from '@remix-run/node';
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

const sessionDir = join(storagePath, 'sessions');

const cookie = createCookie('session', {
	sameSite: 'lax',
	path: '/',
	httpOnly: true,
	secrets: [process.env.COOKIE_SECRET!],
	secure: process.env.NODE_ENV === 'production',
});

export const sessionStorage = createFileSessionStorage({
	dir: sessionDir,
	cookie,
});

// you can also export the methods individually for your own usage
export const { getSession, commitSession, destroySession } = sessionStorage;
