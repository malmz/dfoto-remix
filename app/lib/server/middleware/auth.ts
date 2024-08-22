import type { ServerContext } from 'remix-create-express-app/context';
import type { MiddleWareFunction } from 'remix-create-express-app/middleware';
import { getSession } from './session';
import { decodeIdToken } from 'arctic';
import { parseJWT } from 'oslo/jwt';
import { isFuture, isPast } from 'date-fns';
import { keycloak } from '../auth';

export function getUser(context: ServerContext) {
	return getSession(context).get('user');
}

export function createAuthMiddleware(): MiddleWareFunction {
	return async ({ context, next }) => {
		const session = getSession(context);
		const user = session.get('user');

		if (!user || isFuture(user.accessTokenExpiresAt)) return await next();

		if (user.refreshToken) {
			const tokens = await keycloak.refreshAccessToken(user.refreshToken);
			const accessToken = tokens.accessToken();
			const accessData = parseJWT(accessToken);
			const roles = (accessData?.payload as any).roles ?? [];
			session.set('user', {
				claims: decodeIdToken(tokens.idToken()) as Record<string, string>,
				roles,
				accessToken: tokens.accessToken(),
				accessTokenExpiresAt: tokens.accessTokenExpiresAt(),
				refreshToken: tokens.refreshToken(),
			});
		} else {
			session.unset('user');
		}

		return await next();
	};
}
