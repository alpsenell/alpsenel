import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';

export const prerender = false;

interface DerivedPatch {
  liveSummary?: string;
  lastCheckedAt: string;
  status: 'ok' | 'unreachable';
}

interface RefreshDeps {
  secret: string | undefined;
  today: () => string;
  listProjects: () => Promise<Array<{ handle: string; url: string; name: string }>>;
  fetchSite: (url: string) => Promise<string>;
  summarize: (siteText: string, name: string) => Promise<string>;
  saveDerived: (handle: string, patch: DerivedPatch) => Promise<void>;
}

function json(status: number, data: unknown): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
}

export function createRefreshHandler(deps: RefreshDeps) {
  return async function handle(request: Request): Promise<Response> {
    if (!deps.secret || request.headers.get('authorization') !== `Bearer ${deps.secret}`) {
      return json(401, { error: 'unauthorized' });
    }

    const projects = await deps.listProjects();
    const results: Array<{ handle: string; status: DerivedPatch['status'] }> = [];

    for (const p of projects) {
      const lastCheckedAt = deps.today();
      try {
        const text = await deps.fetchSite(p.url);
        const liveSummary = await deps.summarize(text, p.name);
        await deps.saveDerived(p.handle, { liveSummary, lastCheckedAt, status: 'ok' });
        results.push({ handle: p.handle, status: 'ok' });
      } catch {
        // Omit liveSummary so the merge keeps any previously-derived summary.
        await deps.saveDerived(p.handle, { lastCheckedAt, status: 'unreachable' });
        results.push({ handle: p.handle, status: 'unreachable' });
      }
    }

    return json(200, { refreshed: results.length, results });
  };
}

// --- production helpers ---

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchSiteText(url: string): Promise<string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'user-agent': 'AlpPortfolioBot/1.0' } });
    if (!res.ok) throw new Error(`status ${res.status}`);
    return stripHtml(await res.text()).slice(0, 6000);
  } finally {
    clearTimeout(timer);
  }
}

async function summarizeSite(anthropic: Anthropic, siteText: string, name: string): Promise<string> {
  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 120,
    system:
      'You write ONE factual sentence (max 30 words) describing what a brand or product website currently features or promotes. No marketing fluff, no preamble, no quotes.',
    messages: [{ role: 'user', content: `Site: ${name}\n\nVisible text:\n${siteText}` }],
  });
  const block = msg.content[0];
  const text = block?.type === 'text' ? block.text.trim() : '';
  if (!text) throw new Error('empty summary');
  return text;
}

const handler = createRefreshHandler({
  secret: process.env.CRON_SECRET,
  today: () => new Date().toISOString().slice(0, 10),
  listProjects: async () => (await import('../../db/refresh')).listProjectsForRefresh(),
  fetchSite: fetchSiteText,
  summarize: (text, name) => summarizeSite(new Anthropic({ timeout: 20000, maxRetries: 1 }), text, name),
  saveDerived: async (handle, patch) => (await import('../../db/refresh')).updateProjectDerived(handle, patch),
});

// Vercel Cron issues a GET; also allow POST for manual triggering.
export const GET: APIRoute = ({ request }) => handler(request);
export const POST: APIRoute = ({ request }) => handler(request);
