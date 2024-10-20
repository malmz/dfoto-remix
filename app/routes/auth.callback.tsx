import { type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { extractUserFromToken, keycloak } from '~/lib/.server/auth';
import { getSession } from '~/lib/.server/middleware/session';

export async function loader({ request, context }: LoaderFunctionArgs) {
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

	const newUser = extractUserFromToken(tokens);
	session.set('user', newUser);

	return redirect(returnTo);
}
