import type { ServerContext } from 'remix-create-express-app/context';

declare module '@remix-run/node' {
	interface AppLoadContext extends ServerContext {}
}
