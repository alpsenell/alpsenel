import { describe, it, expect } from 'vitest';
import { createKnowledgeLoader } from './knowledgeStore';
import { DEFAULT_KNOWLEDGE, type KnowledgeData } from '../data/knowledge';

function withBio(bio: string): KnowledgeData {
  return { ...DEFAULT_KNOWLEDGE, bio };
}

describe('createKnowledgeLoader', () => {
  it('returns freshly fetched data on success', async () => {
    const load = createKnowledgeLoader({ fetch: async () => withBio('from-db'), fallback: DEFAULT_KNOWLEDGE });
    expect((await load()).bio).toBe('from-db');
  });

  it('falls back to the default when the fetch fails', async () => {
    const load = createKnowledgeLoader({
      fetch: async () => { throw new Error('db down'); },
      fallback: withBio('fallback'),
    });
    expect((await load()).bio).toBe('fallback');
  });

  it('caches a successful fetch within the TTL', async () => {
    let calls = 0;
    let t = 1000;
    const load = createKnowledgeLoader({
      fetch: async () => { calls++; return withBio('db'); },
      fallback: DEFAULT_KNOWLEDGE,
      ttlMs: 60_000,
      now: () => t,
    });
    await load();
    t = 1000 + 59_000; // still inside the window
    await load();
    expect(calls).toBe(1);
  });

  it('re-fetches after the TTL expires', async () => {
    let calls = 0;
    let t = 1000;
    const load = createKnowledgeLoader({
      fetch: async () => { calls++; return withBio('db'); },
      fallback: DEFAULT_KNOWLEDGE,
      ttlMs: 60_000,
      now: () => t,
    });
    await load();
    t = 1000 + 61_000; // past the window
    await load();
    expect(calls).toBe(2);
  });

  it('does not cache failures — a later successful fetch wins within the same TTL window', async () => {
    let ok = false;
    const load = createKnowledgeLoader({
      fetch: async () => { if (!ok) throw new Error('down'); return withBio('recovered'); },
      fallback: withBio('fallback'),
      ttlMs: 60_000,
      now: () => 1000,
    });
    expect((await load()).bio).toBe('fallback'); // DB down -> fallback, not cached
    ok = true;
    expect((await load()).bio).toBe('recovered'); // retried, got DB data
  });
});
