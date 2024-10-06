import { isFuture } from 'date-fns';
import type { ServerContext } from 'remix-create-express-app/context';
import type { MiddleWareFunction } from 'remix-create-express-app/middleware';
import { extractUserFromToken, keycloak } from '../auth';
import { getSession } from './session';

export function getUser(context: ServerContext) {
	return getSession(context).get('user');
}

export function createAuthMiddleware(): MiddleWareFunction {
	return async ({ context, next }) => {
		const session = getSession(context);
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

		return await next();
	};
}
