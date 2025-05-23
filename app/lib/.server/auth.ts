import { remember } from '@epic-web/remember';
import { redirect, type AppLoadContext } from 'react-router';
import { Authentik, type OAuth2Tokens, decodeIdToken } from 'arctic';
import { parseJWT } from '@oslojs/jwt';
import type { UserClaims } from '../types';

/* const realmURL = process.env.KEYCLOAK_ENDPOINT!;
const clientId = process.env.KEYCLOAK_CLIENTID!;
const clientSecret = process.env.KEYCLOAK_CLIENTSECRET!;
const redirectURI = process.env.KEYCLOAK_REDIRECTURI!; */

const endpointURL = process.env.AUTHENTIK_ENDPOINT!;
const clientId = process.env.AUTHENTIK_CLIENTID!;
const clientSecret = process.env.AUTHENTIK_CLIENTSECRET!;
const redirectURI = process.env.AUTHENTIK_REDIRECTURI!;

export const authClient = remember(
	'authentik',
	() => new Authentik(endpointURL, clientId, clientSecret, redirectURI),
);

/* export const keycloak = remember(
	'keycloak',
	() => new KeyCloak(realmURL, clientId, clientSecret, redirectURI),
); */

export function extractUserFromToken(tokens: OAuth2Tokens) {
	const accessToken = tokens.accessToken();
	const [_header, payload, _signature, _signatureMessage] =
		parseJWT(accessToken);

	console.log({ payload });

	const roles = (payload as any)['roles'] ?? [];

	const claims = decodeIdToken(tokens.idToken()) as UserClaims;

	let refreshTokenExpiresIn: number | undefined = undefined;
	if (
		'refresh_expires_in' in tokens.data &&
		typeof tokens.data.refresh_expires_in === 'number'
	) {
		refreshTokenExpiresIn = tokens.data.refresh_expires_in;
	}

	return {
		claims,
		roles,
		accessToken,
		accessTokenExpiresAt: tokens.accessTokenExpiresAt(),
		refreshToken: tokens.refreshToken(),
		refreshTokenExpiresIn,
	};
}

export function getUserDashboardLink() {
	//return `${endpointURL}/account`;
	return `${endpointURL}/if/user/#/settings;%7B%22page%22%3A%22page-details%22%7D`;
}

export const scopes = [
	'write:album',
	'read:album',
	'delete:album',
	'publish:album',
	'write:image',
	'delete:image',
] as const;

export type Role = (typeof scopes)[number];

export function getUser(context: AppLoadContext) {
	return context.session.get('user');
}

export function ensureRole(roles: Role[], context: AppLoadContext) {
	const user = getUser(context);
	if (!user) {
		throw redirect('/auth/sign-in');
	}

	for (const role of roles) {
		if (!user.roles.includes(role)) {
			throw new Response(`missing role: ${role}`, {
				status: 401,
				statusText: 'Unautharized',
			});
		}
	}
	return user;
}

export function checkRole(roles: Role[], context: AppLoadContext) {
	const user = getUser(context);
	if (!user) {
		return { passed: false as const };
	}

	for (const r of roles) {
		if (!user.roles.includes(r)) {
			return { passed: false as const };
		}
	}

	return { user, passed: true as const };
}
