# Real-time hybrid knowledge store — design

**Date:** 2026-06-27
**Status:** Approved (pending spec review)

## Context

The `/ask` assistant builds its system prompt in `src/pages/api/ask.ts` via
`buildSystemPrompt(lang)` (from `src/data/knowledge.ts`), which reads two
**bundled static files**: `src/data/knowledge.ts` (bio, experience, skills,
availability, flagship, email) and `src/data/projects.ts` (the project list).

`buildSystemPrompt` already runs **per-request** inside the Vercel serverless
function, so the prompt itself is dynamic — but its *data* is compiled into the
deploy bundle. Updating any fact (e.g. adding the Lyma project) requires a code
edit + redeploy.

The repo today: Astro `hybrid` on Vercel (Node 20), `@anthropic-ai/sdk`
(Claude Haiku 4.5 for `/ask`), `@upstash/redis` (rate limiting only). **No
database yet.** `/ask` uses a clean dependency-injection pattern
(`createAskHandler({ getRedis, getAnthropic })`) with vitest coverage.

## Goal

Make the assistant's knowledge **real-time, hybrid**:

1. **Authored, instant-edit (no redeploy):** bio/projects/skills live in an
   editable store; edits go live within seconds.
2. **Auto-derived (self-updating):** a scheduled job enriches each project with
   a fresh, dated "live note" pulled from the actual project site — without
   touching the hand-written copy.

## Non-goals

- **The visible homepage stays static.** Scope is the **AI assistant
  (`/api/ask`) only**. `index.astro` / `tr/index.astro` remain prerendered and
  keep rendering the project list + detail "window" from the static
  `src/data/projects.ts` at build time. Showing a new/edited project *on the
  page* still requires a redeploy. (SSR / ISR of the homepage was considered and
  explicitly declined for simplicity.)
- No live site-fetching in the `/ask` hot path (too slow/costly; storefronts
  have no clean structured data).
- No admin UI in v1 — editing is via Drizzle Studio / SQL.
- The cron does **not** rewrite the hand-authored bilingual briefs.

## Decisions

| Decision | Choice |
| --- | --- |
| Editable store | **Neon Postgres**, in a **separate** Neon project (`alp-portfolio`), isolated from Testerify's DB |
| DB access layer | **Drizzle ORM** + `@neondatabase/serverless` (matches Testerify; migrations + Drizzle Studio for editing) |
| Cron derivation | **Add a separate live note** — write `derived.liveSummary` + `derived.lastCheckedAt`; never overwrite `brief_en`/`brief_tr` |
| Cron cadence | **Nightly** (`0 3 * * *`) via Vercel Cron |
| Editing UX (v1) | Drizzle Studio / SQL — no auth surface to build |
| Scope | **AI assistant (`/api/ask`) only.** Homepage stays static (build-time) |
| Static files | Kept as `DEFAULT_*` — homepage source **and** AI seed/fallback if Neon is unreachable |

## Two sources, two workflows (accepted drift)

Because the homepage stays static, `src/data/projects.ts` + `src/data/knowledge.ts`
stay canonical for the **visible page**, while Neon is canonical for the **AI**.
The two can diverge — that is accepted and intentional. Recommended workflows:

- **Add/edit a project for real (page + AI):** edit the static file, redeploy
  (homepage updates on build); the seed script re-syncs the new defaults into
  Neon so the AI matches.
- **Quick AI-only fact tweak (no deploy):** edit the Neon row directly via
  Drizzle Studio / SQL — live to `/ask` within ~60s, homepage unchanged.

The seed is idempotent and re-runnable, so "edit file → re-seed" keeps the AI in
sync with the page whenever you want them aligned.

## Architecture

```
                 ┌─────────────────── Neon (project: alp-portfolio) ────┐
   you (SQL /     │  site_knowledge (1 row)    projects (1 row each)     │
   Drizzle    ───▶│   authored cols  +  derived jsonb                    │
   Studio)        └───────────▲───────────────────────┬──────────────────┘
                              │ writes derived ONLY    │ read (≤60s cache)
   nightly Vercel Cron ───────┘                        ▼
   POST /api/refresh-knowledge          src/lib/knowledgeStore.ts
   (CRON_SECRET-guarded)                loadKnowledge():
   per project: fetch url → strip       - query both tables (Drizzle)
   → Claude summary → derived           - merge to KnowledgeData
                                        - in-process cache (~60s TTL)
                                        - FALLBACK to DEFAULT_* on error
                                                       │
                              buildSystemPrompt(lang, data)  ──▶ /api/ask
```

## Data model (Drizzle)

`src/db/schema.ts`:

- **`site_knowledge`** (singleton, `id` fixed = 1)
  - `bio`, `experience`, `availability`, `flagship_project`, `contact_email` — `text`
  - `skills` — `jsonb` (`string[]`)
  - `derived` — `jsonb` (reserved; unused in v1)
  - `updated_at` — `timestamptz default now()`
- **`projects`**
  - `id` — `serial` PK
  - `sort_order` — `integer` (drives display order; replaces hand-kept `num`,
    which is derived as zero-padded `sort_order`)
  - `name`, `year`, `url`, `handle` — `text`
  - `tech` — `jsonb` (`string[]`)
  - `brief_en`, `brief_tr` — `text` (**authored, never machine-written**)
  - `derived` — `jsonb`: `{ liveSummary?: string; lastCheckedAt?: string; status?: 'ok'|'unreachable' }`
  - `updated_at` — `timestamptz default now()`

`derived.liveSummary` is a single concise **English** note (the model replies in
the target language regardless). Per-language derivation is a possible later
enhancement, explicitly out of scope for v1.

## Read path

**`src/lib/knowledgeStore.ts`** (new) — the only module that touches the DB on
the read side.

```ts
export interface KnowledgeData {
  bio: string; experience: string; skills: string[];
  availability: string; flagshipProject: string; contactEmail: string;
  projects: Array<{
    num: string; name: string; year: string; url: string; handle: string;
    tech: string[]; brief: Record<Lang, string>;
    derived?: { liveSummary?: string; lastCheckedAt?: string };
  }>;
}

export async function loadKnowledge(): Promise<KnowledgeData>;
```

- Queries `site_knowledge` + `projects` (ordered by `sort_order`) via Drizzle,
  maps rows → `KnowledgeData`.
- **In-process cache:** module-level `{ data, expires }`, TTL ≈ 60s. Warm
  serverless instances skip the DB; manual edits and cron writes appear within
  the TTL.
- **Fallback (fail-safe):** if `DATABASE_URL` is unset or any query throws,
  return `DEFAULT_KNOWLEDGE` (assembled from the existing static content). The
  site never breaks.
- `src/db/client.ts` (new): lazily constructs the Neon/Drizzle client from
  `DATABASE_URL`.

**`src/data/knowledge.ts`** (changed):

- `buildSystemPrompt` stays **pure & synchronous** but takes the data:
  `buildSystemPrompt(lang: Lang, data: KnowledgeData): string`. IO stays out of
  it (keeps it trivially testable).
- When a project has a fresh `derived.liveSummary`, its prompt line gains a
  second sentence: `Live signal (as of <lastCheckedAt>): <liveSummary>`.
- Exports `DEFAULT_KNOWLEDGE: KnowledgeData`, assembled from the current static
  `knowledge` object + `projects` array (kept in the repo as seed + fallback).

**`src/pages/api/ask.ts`** (changed):

- `Deps` gains `getKnowledge: () => Promise<KnowledgeData>`.
- Handler: `const data = await deps.getKnowledge();` then
  `text: buildSystemPrompt(v.lang, data)`.
- Wire-up: `getKnowledge: () => loadKnowledge()`.
- If `loadKnowledge` somehow rejects, it already falls back internally; the
  handler treats it as non-fatal.

## Derive path (Phase 2)

**`src/pages/api/refresh-knowledge.ts`** (new):

- `export const prerender = false`. Guards on `Authorization: Bearer
  $CRON_SECRET`; returns 401 otherwise.
- Loads all projects, then for each: `fetch(url)` with a timeout (~8s), strip
  HTML → text, cap to ~6k chars, ask Claude Haiku for a 1–2 sentence factual
  "what does this site currently feature" summary.
- Writes back **only** `derived` (`liveSummary`, `lastCheckedAt` = today,
  `status`). On fetch/summary failure for a project: set
  `status: 'unreachable'`, leave prior `liveSummary` intact.
- Same DI shape as `ask.ts` (`getAnthropic`, a DB writer) so it's unit-testable
  with mocked fetch + Anthropic.

**`vercel.json`** (new):

```json
{ "crons": [{ "path": "/api/refresh-knowledge", "schedule": "0 3 * * *" }] }
```

Vercel sets the cron `Authorization` header from the project's `CRON_SECRET`.

## Seeding

**`scripts/seed-knowledge.mjs`** (new): reads `DEFAULT_KNOWLEDGE` and upserts
the `site_knowledge` row + one `projects` row per default project (idempotent —
`on conflict` updates authored columns, leaves `derived` alone). Run once after
the first migration; re-runnable to re-sync authored defaults.

## Env vars (add to `.env.example`)

```
DATABASE_URL=postgres://...neon.tech/alp-portfolio
CRON_SECRET=...            # used by Vercel Cron + the refresh route
```

## Package changes

- deps: `drizzle-orm`, `@neondatabase/serverless`
- devDeps: `drizzle-kit`
- scripts: `db:generate`, `db:migrate`, `db:seed`, `db:studio`
- new: `drizzle.config.ts`

## Testing

- `src/lib/knowledgeStore.test.ts` — cache hit vs expiry; fallback to
  `DEFAULT_KNOWLEDGE` when the DB layer throws / `DATABASE_URL` unset; row →
  `KnowledgeData` merge (incl. `derived` line rendering).
- `src/data/knowledge.test.ts` — updated to call
  `buildSystemPrompt(lang, DEFAULT_KNOWLEDGE)`; still asserts project names
  (e.g. `TESTERIFY`, `LYMA`) appear; asserts the `Live signal` line renders only
  when `derived.liveSummary` is present.
- `src/lib/ask.test.ts` — inject a fake `getKnowledge` returning fixture data;
  assert it reaches the prompt.
- `refresh-knowledge` handler test — mock `fetch` + `getAnthropic`; assert only
  `derived` is written and a failed fetch sets `status: 'unreachable'` without
  wiping `liveSummary`.

## Phasing

- **Phase 1 (high value):** schema + migration + `db/client` + `knowledgeStore`
  (cache + fallback) + async-data `buildSystemPrompt` + `ask.ts` wiring + seed
  script + tests. Outcome: edit a row in Neon → live in ≤60s, no deploy.
- **Phase 2 (self-updating):** `refresh-knowledge` route + `vercel.json` cron +
  `Live signal` rendering + tests.

## Risks / mitigations

- **DB latency/availability on every request** → 60s in-process cache +
  hard fallback to `DEFAULT_*`; `/ask` never depends on Neon being up.
- **Cron cost/abuse** → `CRON_SECRET`-guarded route; nightly; Haiku; ~12 small
  summarization calls per run.
- **Drift between code defaults and DB** → `DEFAULT_*` is fallback/seed only;
  the DB is canonical at runtime. Re-running the seed re-syncs authored defaults
  on conflict.
- **Stale `derived` if a site changes between runs** → acceptable; the note is
  explicitly dated ("as of <lastCheckedAt>").
```
