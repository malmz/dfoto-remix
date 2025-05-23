import { redirect } from 'react-router';
import { generateCodeVerifier, generateState } from 'arctic';
import { authClient } from '~/lib/.server/auth';
import type { Route } from './+types/sign-in';

export async function loader({ request, context }: Route.LoaderArgs) {
	const session = context.session;
	const query = new URL(request.url).searchParams;
	const returnTo = query.get('return_to');
	const state = generateState();
	const codeVerifier = generateCodeVerifier();

	const url = authClient.createAuthorizationURL(state, codeVerifier, [
		'profile',
		'email',
		'offline_access',
		'openid',
		'entitlements',
	]);

	session.set('state', state);
	session.set('codeVerifier', codeVerifier);
	if (returnTo) session.set('returnTo', returnTo);
	return redirect(url.toString());
}
