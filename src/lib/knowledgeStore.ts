import { DEFAULT_KNOWLEDGE, type KnowledgeData } from '../data/knowledge';

export interface KnowledgeLoaderDeps {
  /** Reads the canonical knowledge from the store. May reject (DB down / unset). */
  fetch: () => Promise<KnowledgeData>;
  /** Returned whenever fetch rejects, so /ask never breaks. */
  fallback: KnowledgeData;
  /** Cache lifetime in ms. Default 60s. */
  ttlMs?: number;
  /** Injectable clock for testing. Default Date.now. */
  now?: () => number;
}

/**
 * Builds a cached loader: successful fetches are cached for `ttlMs`; failures are
 * not cached and return the fallback, so a recovered DB is picked up on the next call.
 */
export function createKnowledgeLoader(deps: KnowledgeLoaderDeps): () => Promise<KnowledgeData> {
  const ttlMs = deps.ttlMs ?? 60_000;
  const now = deps.now ?? (() => Date.now());
  let cache: { data: KnowledgeData; expires: number } | null = null;

  return async function load(): Promise<KnowledgeData> {
    if (cache && now() < cache.expires) return cache.data;
    try {
      const data = await deps.fetch();
      cache = { data, expires: now() + ttlMs };
      return data;
    } catch {
      return deps.fallback; // do not cache failures — retry next call
    }
  };
}

/**
 * Production loader for /api/ask. The DB layer is imported lazily so the Drizzle/Neon
 * dependencies stay out of the hot path until a cache miss actually needs them.
 */
export const loadKnowledge = createKnowledgeLoader({
  fetch: async () => {
    const { fetchKnowledgeFromDb } = await import('../db/knowledgeQuery');
    return fetchKnowledgeFromDb();
  },
  fallback: DEFAULT_KNOWLEDGE,
});
