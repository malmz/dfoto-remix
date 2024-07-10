import { logto } from '~/lib/auth.server';

export const loader = logto.handleAuthRoutes({
	'sign-in': {
		path: '/auth/sign-in',
		redirectBackTo: '/auth/callback',
	},
	'sign-in-callback': {
		path: '/auth/callback',
		redirectBackTo: '/',
	},
	'sign-out': {
		path: '/auth/sign-out',
		redirectBackTo: '/',
	},
});
