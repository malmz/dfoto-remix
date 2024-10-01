import { redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { generateCodeVerifier, generateState } from 'arctic';
import { keycloak, scopes } from '~/lib/server/auth';
import { getSession } from '~/lib/server/middleware/session';

export async function loader({ request, context }: LoaderFunctionArgs) {
	const session = getSession(context);
	const query = new URL(request.url).searchParams;
	const returnTo = query.get('return_to');
	const state = generateState();
	const codeVerifier = generateCodeVerifier();

	const url = keycloak.createAuthorizationURL(state, codeVerifier, [
		'profile',
		'email',
		'offline_access',
		'openid',
	]);

	session.set('state', state);
	session.set('codeVerifier', codeVerifier);
	returnTo && session.set('returnTo', returnTo);
	return redirect(url.toString());
}
