import { redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { ArcticFetchError, OAuth2RequestError } from 'arctic';
import { keycloak } from '~/lib/server/auth';
import { getSession } from '~/lib/server/middleware/session';

export async function loader({ context }: LoaderFunctionArgs) {
	const session = getSession(context);
	const user = session.get('user');
	try {
		user && (await keycloak.revokeToken(user.accessToken));
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
