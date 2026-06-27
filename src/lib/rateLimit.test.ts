import { describe, it, expect } from 'vitest';
import { checkRateLimit, getClientIp, PER_VISITOR, CONTACT_LIMIT } from './rateLimit';

function fakeKv() {
  const store = new Map<string, number>();
  return {
    store,
    async incr(key: string) { const n = (store.get(key) ?? 0) + 1; store.set(key, n); return n; },
    async expire() { return 1; },
  };
}

const NOW = new Date('2026-06-23T10:00:00Z');

describe('checkRateLimit', () => {
  it('allows the first request and reports remaining', async () => {
    const kv = fakeKv();
    const r = await checkRateLimit(kv, '1.1.1.1', NOW);
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(PER_VISITOR - 1);
  });

  it('blocks the same visitor after the per-visitor cap', async () => {
    const kv = fakeKv();
    for (let i = 0; i < PER_VISITOR; i++) await checkRateLimit(kv, '2.2.2.2', NOW);
    const r = await checkRateLimit(kv, '2.2.2.2', NOW);
    expect(r.allowed).toBe(false);
    expect(r.scope).toBe('ip');
  });

  it('separates visitors by ip', async () => {
    const kv = fakeKv();
    for (let i = 0; i < PER_VISITOR; i++) await checkRateLimit(kv, '3.3.3.3', NOW);
    const other = await checkRateLimit(kv, '4.4.4.4', NOW);
    expect(other.allowed).toBe(true);
  });

  it('uses a separate namespace + cap per config (contact does not share the ask quota)', async () => {
    const kv = fakeKv();
    // Exhaust the contact cap for one visitor...
    for (let i = 0; i < CONTACT_LIMIT.perVisitor; i++) await checkRateLimit(kv, '7.7.7.7', NOW, CONTACT_LIMIT);
    expect((await checkRateLimit(kv, '7.7.7.7', NOW, CONTACT_LIMIT)).allowed).toBe(false);
    // ...the ask endpoint for the same IP is untouched.
    expect((await checkRateLimit(kv, '7.7.7.7', NOW)).allowed).toBe(true);
  });
});

describe('getClientIp', () => {
  it('reads the first hop of x-forwarded-for', () => {
    const req = new Request('https://x', { headers: { 'x-forwarded-for': '9.9.9.9, 10.0.0.1' } });
    expect(getClientIp(req)).toBe('9.9.9.9');
  });
});
