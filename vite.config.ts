import { vitePlugin as remix } from '@remix-run/dev';
import { installGlobals } from '@remix-run/node';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import envOnly from 'vite-env-only';
import { remixDevTools } from 'remix-development-tools';

installGlobals({ nativeFetch: true });

export default defineConfig({
  build: {
    target: 'esnext',
  },
  plugins: [
    envOnly(),
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
