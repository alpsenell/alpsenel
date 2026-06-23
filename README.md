# alpsenel.com

Bilingual Astro portfolio with an AI "ask the operator" hero.

## Develop
- `npm run dev` — local dev on :4178
- `npm test` — unit tests (vitest)
- `npm run build` — static pages + the `/api/ask` serverless function

## Required env (Vercel project settings)
- `ANTHROPIC_API_KEY` — Anthropic API key (server-only)
- `KV_REST_API_URL`, `KV_REST_API_TOKEN` — Vercel KV / Upstash Redis

## Deploy (Vercel)
1. Import the GitHub repo into Vercel (framework auto-detected: Astro).
2. Create a Vercel KV (Upstash) store and link it — it injects the KV_* env vars.
3. Add `ANTHROPIC_API_KEY` in Project → Settings → Environment Variables.
4. Deploy. Add the `alpsenel.com` domain.

## Editing the AI's knowledge
Fill in the real bio / experience / skills / availability in
`src/data/knowledge.ts` (the TODO fields). Rate limits live in
`src/lib/rateLimit.ts` (`PER_VISITOR`, `GLOBAL`).
