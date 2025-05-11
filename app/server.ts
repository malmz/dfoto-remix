import { isFuture } from 'date-fns';
import { createMiddleware } from 'hono/factory';
import { createCookieSessionStorage } from 'react-router';
import { createHonoServer } from 'react-router-hono-server/node';
import { getSession, session } from 'remix-hono/session';
import { extractUserFromToken, keycloak } from './lib/.server/auth';
import type { Session } from 'react-router';
import type { SessionState } from './lib/types';

declare module 'react-router' {
	interface AppLoadContext {
		session: Session<SessionState>;
	}
}

type Variables = Record<symbol, unknown>;

type ContextEnv = { Variables: Variables };

const authMiddleware = createMiddleware(async (c, next) => {
	const session = getSession(c);
	const user = session.get('user');
	if (!user || isFuture(user.accessTokenExpiresAt)) return await next();

	if (user.refreshToken) {
		try {
			const tokens = await keycloak.refreshAccessToken(user.refreshToken);
			const newUser = extractUserFromToken(tokens);
			session.set('user', newUser);
		} catch (error) {
			console.error('refresh token', error);
			session.unset('user');
		}
	} else {
		session.unset('user');
	}

	await next();
});

const sessionMiddleware = session({
	autoCommit: true,
	createSessionStorage() {
		const sessionStorage = createCookieSessionStorage({
			cookie: {
				name: 'session',
				httpOnly: true,
				path: '/',
				sameSite: 'lax',
				secrets: [process.env.COOKIE_SECRET!],
				secure: process.env.NODE_ENV === 'production',
			},
		});

		return {
			...sessionStorage,
			// If a user doesn't come back to the app within 30 days, their session will be deleted.
			async commitSession(session) {
				return sessionStorage.commitSession(session, {
					maxAge: 60 * 60 * 24 * 30, // 30 days
				});
			},
		};
	},
});

export default await createHonoServer<ContextEnv>({
	configure(server) {
		server.use(sessionMiddleware, authMiddleware);
	},
	getLoadContext(c, _options) {
		const session = getSession(c);
		return { session };
	},
});
