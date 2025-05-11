import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { reactRouterHonoServer } from 'react-router-hono-server/dev';

export default defineConfig({
	build: {
		target: 'esnext',
	},
	plugins: [
		tailwindcss(),
		reactRouterHonoServer(),
		reactRouter(),
		tsconfigPaths(),
	],
});
