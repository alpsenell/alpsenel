import { asc } from 'drizzle-orm';
import type { KnowledgeData, KnowledgeProject } from '../data/knowledge';
import { getDb } from './client';
import { siteKnowledge, projects as projectsTable } from './schema';

/** Structural shapes of the rows the mapper needs (subset of the Drizzle row types). */
interface SiteRow {
  bio: string;
  experience: string;
  skills: string[];
  availability: string;
  flagshipProject: string;
  contactEmail: string;
}
interface ProjectRow {
  sortOrder: number;
  name: string;
  year: string;
  url: string;
  handle: string;
  tech: string[];
  briefEn: string;
  briefTr: string;
  derived: { liveSummary?: string; lastCheckedAt?: string } | null;
}

/** Pure mapping from DB rows to the prompt's KnowledgeData shape. Preserves row order. */
export function rowsToKnowledge(site: SiteRow, rows: ProjectRow[]): KnowledgeData {
  const projects: KnowledgeProject[] = rows.map((r) => {
    const p: KnowledgeProject = {
      num: String(r.sortOrder).padStart(2, '0'),
      name: r.name,
      year: r.year,
      url: r.url,
      handle: r.handle,
      tech: r.tech,
      brief: { en: r.briefEn, tr: r.briefTr },
    };
    if (r.derived?.liveSummary) {
      p.derived = { liveSummary: r.derived.liveSummary, lastCheckedAt: r.derived.lastCheckedAt };
    }
    return p;
  });

  return {
    bio: site.bio,
    experience: site.experience,
    skills: site.skills,
    availability: site.availability,
    flagshipProject: site.flagshipProject,
    contactEmail: site.contactEmail,
    projects,
  };
}

/** Reads the canonical knowledge from Neon. Throws if unset/unseeded (loader falls back). */
export async function fetchKnowledgeFromDb(): Promise<KnowledgeData> {
  const db = getDb();
  const [site] = await db.select().from(siteKnowledge).limit(1);
  if (!site) throw new Error('knowledge not seeded');
  const rows = await db.select().from(projectsTable).orderBy(asc(projectsTable.sortOrder));
  return rowsToKnowledge(site, rows);
}
