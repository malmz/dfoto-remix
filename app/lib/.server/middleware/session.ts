import type { SessionStorage, Session, AppLoadContext } from '@remix-run/node';
import {
	createContext,
	contextGet,
	type ServerContext,
} from 'remix-create-express-app/context';
import type { MiddlewareFunctionArgs } from 'remix-create-express-app/middleware';
import type { UserState } from './types';

export type SessionMiddlewareArgs = {
	isCookieSessionStorage: boolean;
};

// create SessionContext for use with context.get and .set
export const SessionContext =
	createContext<
		Session<{
			user: UserState;
			state: string;
			codeVerifier: string;
			returnTo: string;
		}>
	>();

export function getSession(context: ServerContext) {
	return context.get(SessionContext);
}

// creates session middleware that auto-commits the session cookie when mutated
export function createSessionMiddleware(storage: SessionStorage) {
	const { getSession, commitSession } = storage;

	return async ({ request, context, next }: MiddlewareFunctionArgs) => {
		const session = await getSession(request.headers.get('Cookie'));
		type PropType = keyof typeof session;

		// setup a proxy to track if the session has been modified
		// so we can commit it back to the store
		const sessionProxy = {
			_isDirty: false,
			_data: JSON.stringify(session.data),
			get isDirty() {
				return this._isDirty || this._data !== JSON.stringify(session.data);
			},
			get(target: typeof session, prop: PropType) {
				this._isDirty ||= ['set', 'unset', 'destroy', 'flash'].includes(prop);
				return target[prop];
			},
		};

		const session$ = new Proxy(session, sessionProxy) as typeof session;
		// set the session context
		context.set(SessionContext, session$);

		const response = await next();

		if (sessionProxy.isDirty) {
			const result = await commitSession(session$);
			response.headers.append('Set-Cookie', result);
		}
		return response;
	};
}
