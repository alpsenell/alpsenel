import { describe, it, expect } from 'vitest';
import { createAskHandler } from './ask';

function fakeRedis() {
  const store = new Map<string, number>();
  return { async incr(k: string) { const n = (store.get(k) ?? 0) + 1; store.set(k, n); return n; }, async expire() { return 1; } };
}

// Minimal fake Anthropic that yields two text deltas.
function fakeAnthropic() {
  return {
    messages: {
      async create() {
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
  const handler = createAskHandler({ getRedis: () => fakeRedis() as any, getAnthropic: () => fakeAnthropic() as any });

  it('streams the answer text on a valid request', async () => {
    const res = await handler(post({ question: 'What is your stack?', lang: 'en' }));
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('Hello world');
  });

  it('returns 400 on an empty question', async () => {
    const res = await handler(post({ question: '   ', lang: 'en' }));
    expect(res.status).toBe(400);
  });

  it('returns 429 once the per-visitor cap is exceeded', async () => {
    const shared = fakeRedis();
    const h = createAskHandler({ getRedis: () => shared as any, getAnthropic: () => fakeAnthropic() as any });
    let last: Response | undefined;
    for (let i = 0; i < 11; i++) last = await h(post({ question: 'hi', lang: 'en' }));
    expect(last!.status).toBe(429);
  });
});
