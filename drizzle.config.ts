import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'postgresql',
	schema: './app/lib/.server/schema.ts',
	out: './migrations',
	dbCredentials: {
		url: process.env.DATABASE_URL ?? '',
	},
});
