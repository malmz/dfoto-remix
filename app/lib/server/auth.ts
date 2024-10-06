import { remember } from '@epic-web/remember';
import { redirect } from '@remix-run/node';
import { KeyCloak, type OAuth2Tokens, decodeIdToken } from 'arctic';
import { parseJWT } from 'oslo/jwt';
import type { ServerContext } from 'remix-create-express-app/context';
import { getUser } from './middleware/auth';

const realmURL = process.env.KEYCLOAK_ENDPOINT!;
const clientId = process.env.KEYCLOAK_CLIENTID!;
const clientSecret = process.env.KEYCLOAK_CLIENTSECRET!;
const redirectURI = process.env.KEYCLOAK_REDIRECTURI!;

export const keycloak = remember(
	'keycloak',
	() => new KeyCloak(realmURL, clientId, clientSecret, redirectURI),
);

export function extractUserFromToken(tokens: OAuth2Tokens) {
	const accessToken = tokens.accessToken();
	const accessData = parseJWT(accessToken);
	if (!accessData) throw new Error('access token is not a jwt');

	const roles =
		(accessData.payload as Record<string, any>).resource_access?.[clientId]
			.roles ?? [];

	return {
		claims: decodeIdToken(tokens.idToken()) as Record<string, string>,
		roles,
		accessToken: tokens.accessToken(),
		accessTokenExpiresAt: tokens.accessTokenExpiresAt(),
		refreshToken: tokens.refreshToken(),
	};
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

export function ensureRole(roles: Role[], context: ServerContext) {
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

export function checkRole(roles: Role[], context: ServerContext) {
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
