/**
 * Publishes content/about.md to the assistant's knowledge: reads the file,
 * strips editing comments, and writes it to site_knowledge.facts (id = 1).
 * The change is live to /ask within ~60s — no redeploy.
 *
 *   npm run push:about
 *
 * Aborts without writing if the prepared content is empty, so a blank or
 * comment-only file can never wipe the assistant's facts.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { eq } from 'drizzle-orm';
import { getDb } from '../src/db/client';
import { siteKnowledge } from '../src/db/schema';
import { prepareAbout } from '../src/lib/aboutMarkdown';

const aboutPath = fileURLToPath(new URL('../content/about.md', import.meta.url));

async function main() {
  const facts = prepareAbout(readFileSync(aboutPath, 'utf8'));
  if (!facts) {
    console.error('content/about.md has no content after stripping comments — aborting (nothing written).');
    process.exit(1);
  }

  const db = getDb();
  const updated = await db
    .update(siteKnowledge)
    .set({ facts, updatedAt: new Date() })
    .where(eq(siteKnowledge.id, 1))
    .returning({ id: siteKnowledge.id });

  if (updated.length === 0) {
    console.error('No site_knowledge row found (id = 1). Run `npm run db:seed` first.');
    process.exit(1);
  }

  console.log(`Published content/about.md to facts (${facts.length} chars). Live to /ask within ~60s.`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
