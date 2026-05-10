import type { Config } from 'drizzle-kit';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return;
  const text = readFileSync(envPath, 'utf8');
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvLocal();

const turso = process.env.TURSO_DATABASE_URL;

// Use absolute file path for local DB — libsql is unreliable about resolving
// relative `file:./...` URLs with drizzle-kit's turso dialect.
const localDbUrl = `file:${resolve(process.cwd(), 'atelier.db')}`;

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: turso
    ? { url: turso, authToken: process.env.TURSO_AUTH_TOKEN! }
    : { url: localDbUrl },
} satisfies Config;
