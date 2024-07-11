import { logto } from '~/lib/server/auth';

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
	'sign-up': {
		path: '/auth/sign-up',
		redirectBackTo: '/',
	},
});
