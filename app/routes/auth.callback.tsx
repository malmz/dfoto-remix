import {
	unstable_defineLoader as defineLoader,
	redirect,
} from '@remix-run/node';
import { decodeIdToken } from 'arctic';
import { parseJWT } from 'oslo/jwt';
import { keycloak } from '~/lib/server/auth';
import { getSession } from '~/lib/server/middleware/session';

export const loader = defineLoader(async ({ request, context }) => {
	const session = getSession(context);
	const query = new URL(request.url).searchParams;

	const code = query.get('code');
	const state = query.get('state');

	const storedState = session.get('state');
	const storedCodeVerifier = session.get('codeVerifier');
	const returnTo = session.get('returnTo') ?? '/';

	session.unset('state');
	session.unset('codeVerifier');
	session.unset('returnTo');

	if (!code || !storedState || !storedCodeVerifier || state !== storedState) {
		throw new Error('Invalid request');
	}

	const tokens = await keycloak.validateAuthorizationCode(
		code,
		storedCodeVerifier,
	);

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

	return redirect(returnTo);
});
