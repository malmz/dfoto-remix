import { redirect } from '@remix-run/node';
import { sessionStorage } from './session.server';
import { makeLogtoRemix } from '@logto/remix';
import { remember } from '@epic-web/remember';

export const resource = 'https://dfoto.se';
export const scopes = [
	'write:album',
	'read:album',
	'delete:album',
	'publish:album',
	'write:image',
	'delete:image',
] as const;

export type Role = (typeof scopes)[number];

export const logto = remember('logto', () =>
	makeLogtoRemix(
		{
			endpoint: process.env.LOGTO_ENDPOINT!,
			appId: process.env.LOGTO_APP_ID!,
			appSecret: process.env.LOGTO_APP_SECRET!,
			baseUrl: process.env.BASE_URL!,
			resources: [resource],
			scopes: scopes as unknown as string[],
		},
		{ sessionStorage },
	),
);

export function ensureRole(
	roles: Role[],
	params?: Parameters<(typeof logto)['getContext']>,
) {
	return async (request: Request) => {
		const ctx = await logto.getContext({
			getAccessToken: true,
			resource: resource,
			...params,
		})(request);
		if (!ctx.isAuthenticated) {
			throw redirect('/auth/sign-in');
		}

		for (const role of roles) {
			if (!ctx.scopes?.includes(role)) {
				throw new Response(`unauthorized: missing role: ${role}`, {
					status: 401,
				});
			}
		}
		return ctx;
	};
}

export function checkRole(
	roles: Role[],
	params?: Parameters<(typeof logto)['getContext']>,
) {
	return async (request: Request) => {
		const ctx = await logto.getContext({
			getAccessToken: true,
			resource: resource,
			...params,
		})(request);

		if (!ctx.isAuthenticated) {
			return { ...ctx, passed: false };
		}

		for (const r of roles) {
			if (!ctx.scopes?.includes(r)) {
				return { ...ctx, passed: false };
			}
		}

		return { ...ctx, passed: true };
	};
}
