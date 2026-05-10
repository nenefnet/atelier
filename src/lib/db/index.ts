import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { resolve } from 'node:path';
import * as schema from './schema';

// libsql is finicky with `file:./relative` URLs — use an absolute path so the
// runtime and drizzle-kit always open the same database file.
const url =
  process.env.TURSO_DATABASE_URL || `file:${resolve(process.cwd(), 'atelier.db')}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url, authToken });

export const db = drizzle(client, { schema });

export * from './schema';
