import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { reactRouterHonoServer } from 'react-router-hono-server/dev'; // add this

export default defineConfig({
	build: {
		target: 'esnext',
	},
	plugins: [reactRouterHonoServer(), reactRouter(), tsconfigPaths()],
});
