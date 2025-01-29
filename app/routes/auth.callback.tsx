import { type LoaderFunctionArgs, redirect } from 'react-router';
import { extractUserFromToken, keycloak } from '~/lib/.server/auth';
import { db } from '~/lib/.server/db';
import { userTable } from '~/lib/.server/schema';
import type { Route } from './+types/auth.callback';

export async function loader({ request, context }: Route.LoaderArgs) {
	const session = context.session;
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

	const newUser = extractUserFromToken(tokens);
	session.set('user', newUser);

	const name = newUser.claims.name ?? newUser.claims.preferred_username;
	await db
		.insert(userTable)
		.values({ id: newUser.claims.sub, name })
		.onConflictDoUpdate({
			target: userTable.id,
			set: {
				name,
			},
		});

	return redirect(returnTo);
}
