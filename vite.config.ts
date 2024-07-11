import { vitePlugin as remix } from '@remix-run/dev';
import { installGlobals } from '@remix-run/node';
import { remixDevTools } from 'remix-development-tools';
import { defineConfig } from 'vite';
import { denyImports, envOnlyMacros } from 'vite-env-only';
import tsconfigPaths from 'vite-tsconfig-paths';

installGlobals({ nativeFetch: true });

export default defineConfig({
	build: {
		target: 'esnext',
	},
	plugins: [
		denyImports({
			client: {
				specifiers: [/^node:/, 'drizzle-orm*', 'postgres'],
				files: ['**/.server/*', '**/*.server.*'],
			},
		}),
		envOnlyMacros(),
		remixDevTools(),
		remix({
			future: {
				unstable_singleFetch: true,
				v3_relativeSplatPath: true,
				v3_fetcherPersist: true,
				v3_throwAbortReason: true,
			},
		}),
		tsconfigPaths(),
	],
});
