import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './schema';

async function runMigrations() {
  if (process.env.MIGRATE) {
    const migrationClient = postgres(process.env.DATABASE_URL ?? '', {
      max: 1,
    });
    await migrate(drizzle(migrationClient), { migrationsFolder: 'migrations' });
  }
}

const queryClient = postgres(process.env.DATABASE_URL ?? '');
export const db = drizzle(queryClient, { schema });
