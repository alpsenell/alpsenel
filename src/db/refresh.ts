import { asc, eq, sql } from 'drizzle-orm';
import { getDb } from './client';
import { projects as projectsTable } from './schema';

/** Minimal project info the cron needs to fetch + summarize each site. */
export async function listProjectsForRefresh(): Promise<Array<{ handle: string; url: string; name: string }>> {
  const db = getDb();
  return db
    .select({ handle: projectsTable.handle, url: projectsTable.url, name: projectsTable.name })
    .from(projectsTable)
    .orderBy(asc(projectsTable.sortOrder));
}

/**
 * Merges `patch` into a project's `derived` jsonb (does not replace it), so an
 * 'unreachable' update that omits liveSummary leaves the prior summary intact.
 */
export async function updateProjectDerived(
  handle: string,
  patch: { liveSummary?: string; lastCheckedAt?: string; status?: 'ok' | 'unreachable' },
): Promise<void> {
  const db = getDb();
  await db
    .update(projectsTable)
    .set({
      derived: sql`COALESCE(${projectsTable.derived}, '{}'::jsonb) || ${JSON.stringify(patch)}::jsonb`,
      updatedAt: new Date(),
    })
    .where(eq(projectsTable.handle, handle));
}
