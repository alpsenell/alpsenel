import { describe, it, expect } from 'vitest';
import { createAskHandler } from '../pages/api/ask';
import { DEFAULT_KNOWLEDGE, type KnowledgeData } from '../data/knowledge';

function fakeRedis() {
  const store = new Map<string, number>();
  return { async incr(k: string) { const n = (store.get(k) ?? 0) + 1; store.set(k, n); return n; }, async expire() { return 1; } };
}

// Minimal fake Anthropic that yields two text deltas; optionally records the system prompt.
function fakeAnthropic(capture?: { system?: string }) {
  return {
    messages: {
      async create(args: any) {
        if (capture) capture.system = args?.system?.[0]?.text ?? '';
        return (async function* () {
          yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Hello ' } };
          yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'world' } };
        })();
      },
    },
  };
}

function post(body: unknown) {
  return new Request('https://x/api/ask', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '5.5.5.5' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/ask', () => {
  const baseDeps = {
    getRedis: () => fakeRedis() as any,
    getAnthropic: () => fakeAnthropic() as any,
    getKnowledge: async () => DEFAULT_KNOWLEDGE,
  };

  it('streams the answer text on a valid request', async () => {
    const res = await createAskHandler(baseDeps)(post({ question: 'What is your stack?', lang: 'en' }));
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('Hello world');
  });

  it('feeds the loaded knowledge into the system prompt', async () => {
    const capture: { system?: string } = {};
    const data: KnowledgeData = {
      ...DEFAULT_KNOWLEDGE,
      projects: [
        { num: '01', name: 'ZZTOPSECRET', year: '2026', url: 'https://x', handle: 'z', tech: ['X'], brief: { en: 'b', tr: 'b' } },
      ],
    };
    const handler = createAskHandler({
      getRedis: () => fakeRedis() as any,
      getAnthropic: () => fakeAnthropic(capture) as any,
      getKnowledge: async () => data,
    });
    await handler(post({ question: 'hi', lang: 'en' }));
    expect(capture.system).toContain('ZZTOPSECRET');
  });

  it('returns 400 on an empty question', async () => {
    const res = await createAskHandler(baseDeps)(post({ question: '   ', lang: 'en' }));
    expect(res.status).toBe(400);
  });

  it('returns 429 once the per-visitor cap is exceeded', async () => {
    const shared = fakeRedis();
    const h = createAskHandler({ ...baseDeps, getRedis: () => shared as any });
    let last: Response | undefined;
    for (let i = 0; i < 11; i++) last = await h(post({ question: 'hi', lang: 'en' }));
    expect(last!.status).toBe(429);
  });
});
