import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof createClient> | undefined;
  db: ReturnType<typeof drizzle<typeof schema>> | undefined;
};

function createDbClient() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error(
      'TURSO_DATABASE_URL is not set. Add it to your environment variables.'
    );
  }

  return createClient({
    url,
    authToken: authToken || undefined,
  });
}

const client = globalForDb.client ?? createDbClient();
const db =
  globalForDb.db ??
  drizzle(client, {
    schema,
    logger: process.env.NODE_ENV === 'development',
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.client = client;
  globalForDb.db = db;
}

export { db, client };
export type { schema };
