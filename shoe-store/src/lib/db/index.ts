import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof createClient> | undefined;
  db: ReturnType<typeof drizzle<typeof schema>> | undefined;
};

const client =
  globalForDb.client ??
  createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

const db =
  globalForDb.db ??
  drizzle(client, { schema, logger: process.env.NODE_ENV === 'development' });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.client = client;
  globalForDb.db = db;
}

export { db, client };
export type { schema };