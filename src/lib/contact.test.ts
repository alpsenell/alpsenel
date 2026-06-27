import { describe, it, expect } from 'vitest';
import { createContactHandler } from '../pages/api/contact';
import { CONTACT_LIMIT } from './rateLimit';

function fakeRedis() {
  const store = new Map<string, number>();
  return { async incr(k: string) { const n = (store.get(k) ?? 0) + 1; store.set(k, n); return n; }, async expire() { return 1; } };
}

// Records each send so tests can assert on the payload; configurable failure mode.
function fakeResend(opts: { sent?: any[]; mode?: 'ok' | 'throw' | 'error' } = {}) {
  const mode = opts.mode ?? 'ok';
  return {
    emails: {
      async send(args: any) {
        if (mode === 'throw') throw new Error('network');
        if (mode === 'error') return { data: null, error: { message: 'bad domain' } };
        opts.sent?.push(args);
        return { data: { id: 'eml_1' }, error: null };
      },
    },
  };
}

function post(body: unknown, ip = '5.5.5.5') {
  return new Request('https://x/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  });
}

const valid = { name: 'Alp', email: 'visitor@example.com', message: 'I would like to work with you.', lang: 'en' };

describe('POST /api/contact', () => {
  it('sends the email and returns 200 on a valid submission', async () => {
    const sent: any[] = [];
    const handler = createContactHandler({ getRedis: () => fakeRedis() as any, getResend: () => fakeResend({ sent }) as any });
    const res = await handler(post(valid));
    expect(res.status).toBe(200);
    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe('alp@testerify.com');
    expect(sent[0].replyTo).toBe('visitor@example.com');
    expect(sent[0].text).toContain('I would like to work with you.');
  });

  it('returns 400 with the email reason on an invalid address', async () => {
    const handler = createContactHandler({ getRedis: () => fakeRedis() as any, getResend: () => fakeResend() as any });
    const res = await handler(post({ ...valid, email: 'nope' }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('email');
  });

  it('silently drops a honeypot hit without sending', async () => {
    const sent: any[] = [];
    const handler = createContactHandler({ getRedis: () => fakeRedis() as any, getResend: () => fakeResend({ sent }) as any });
    const res = await handler(post({ ...valid, company: 'Spambot LLC' }));
    expect(res.status).toBe(200);
    expect(sent).toHaveLength(0);
  });

  it('rate-limits after the per-visitor cap', async () => {
    const shared = fakeRedis();
    const handler = createContactHandler({ getRedis: () => shared as any, getResend: () => fakeResend() as any });
    let last: Response | undefined;
    for (let i = 0; i < CONTACT_LIMIT.perVisitor + 1; i++) last = await handler(post(valid));
    expect(last!.status).toBe(429);
  });

  it('returns 502 when the provider throws', async () => {
    const handler = createContactHandler({ getRedis: () => fakeRedis() as any, getResend: () => fakeResend({ mode: 'throw' }) as any });
    expect((await handler(post(valid))).status).toBe(502);
  });

  it('returns 502 when the provider resolves with an error', async () => {
    const handler = createContactHandler({ getRedis: () => fakeRedis() as any, getResend: () => fakeResend({ mode: 'error' }) as any });
    expect((await handler(post(valid))).status).toBe(502);
  });

  it('returns 503 when the rate-limit store is unavailable', async () => {
    const brokenRedis = { async incr() { throw new Error('down'); }, async expire() { return 1; } };
    const handler = createContactHandler({ getRedis: () => brokenRedis as any, getResend: () => fakeResend() as any });
    expect((await handler(post(valid))).status).toBe(503);
  });
});
