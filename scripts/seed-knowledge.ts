/**
 * Seeds Neon from the hand-authored DEFAULT_KNOWLEDGE. Idempotent: upserts the
 * site_knowledge singleton and one row per project (keyed by handle), updating the
 * authored columns and leaving each project's cron-owned `derived` column untouched.
 *
 * Run once after the first migration, or any time you want the DB re-synced to the
 * static defaults:  npm run db:seed   (loads DATABASE_URL from .env)
 */
import { getDb } from '../src/db/client';
import { siteKnowledge, projects as projectsTable } from '../src/db/schema';
import { DEFAULT_KNOWLEDGE } from '../src/data/knowledge';

async function main() {
  const db = getDb();
  const k = DEFAULT_KNOWLEDGE;

  await db
    .insert(siteKnowledge)
    .values({
      id: 1,
      bio: k.bio,
      experience: k.experience,
      skills: k.skills,
      availability: k.availability,
      flagshipProject: k.flagshipProject,
      contactEmail: k.contactEmail,
    })
    .onConflictDoUpdate({
      target: siteKnowledge.id,
      set: {
        bio: k.bio,
        experience: k.experience,
        skills: k.skills,
        availability: k.availability,
        flagshipProject: k.flagshipProject,
        contactEmail: k.contactEmail,
        updatedAt: new Date(),
      },
    });

  for (let i = 0; i < k.projects.length; i++) {
    const p = k.projects[i];
    const sortOrder = i + 1;
    await db
      .insert(projectsTable)
      .values({
        sortOrder,
        name: p.name,
        year: p.year,
        url: p.url,
        handle: p.handle,
        tech: p.tech,
        briefEn: p.brief.en,
        briefTr: p.brief.tr,
      })
      .onConflictDoUpdate({
        target: projectsTable.handle,
        set: {
          sortOrder,
          name: p.name,
          year: p.year,
          url: p.url,
          tech: p.tech,
          briefEn: p.brief.en,
          briefTr: p.brief.tr,
          updatedAt: new Date(),
        },
      });
  }

  console.log(`Seeded site_knowledge + ${k.projects.length} projects.`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
