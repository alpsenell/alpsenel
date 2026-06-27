import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

let db: NeonHttpDatabase<typeof schema> | null = null;

/** Lazily builds the Neon/Drizzle client from DATABASE_URL. Throws if unset. */
export function getDb(): NeonHttpDatabase<typeof schema> {
  if (db) return db;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  db = drizzle(neon(url), { schema });
  return db;
}
