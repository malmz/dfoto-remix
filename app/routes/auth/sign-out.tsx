import { type LoaderFunctionArgs, redirect } from 'react-router';
import { ArcticFetchError, OAuth2RequestError } from 'arctic';
import { authClient } from '~/lib/.server/auth';
import type { Route } from './+types/sign-out';

export async function loader({ context }: Route.LoaderArgs) {
	const session = context.session;
	const user = session.get('user');
	try {
		if (user) {
			await authClient.revokeToken(user.accessToken);
		}
	} catch (e) {
		if (e instanceof OAuth2RequestError) {
			console.error('auth error', e);

			// Invalid authorization code, credentials, or redirect URI
		}
		if (e instanceof ArcticFetchError) {
			console.error('fetch error', e);

			// Failed to call `fetch()`
		}

		console.error('parse error', e);

		// Parse error
	}

	session.unset('user');
	return redirect('/');
}
