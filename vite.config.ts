import { vitePlugin as remix } from '@remix-run/dev';
import { installGlobals } from '@remix-run/node';
import { expressDevServer } from 'remix-express-dev-server';
import { defineConfig } from 'vite';
import { denyImports, envOnlyMacros } from 'vite-env-only';
import tsconfigPaths from 'vite-tsconfig-paths';

installGlobals({ nativeFetch: true });

declare module '@remix-run/node' {
	interface Future {
		unstable_singleFetch: true;
	}
}

export default defineConfig({
	build: {
		target: 'esnext',
	},
	plugins: [
		expressDevServer(),
		denyImports({
			client: {
				files: ['**/lib/server/*', '**/.server/*', '**/*.server.*'],
			},
		}),
		envOnlyMacros(),
		//remixDevTools(),
		remix({
			future: {
				unstable_singleFetch: true,
				unstable_optimizeDeps: true,
				unstable_lazyRouteDiscovery: true,
				v3_relativeSplatPath: true,
				v3_fetcherPersist: true,
				v3_throwAbortReason: true,
			},
		}),
		tsconfigPaths(),
	],
});
