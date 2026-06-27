import { describe, it, expect } from 'vitest';
import { createRefreshHandler } from '../pages/api/refresh-knowledge';

function req(secret?: string) {
  return new Request('https://x/api/refresh-knowledge', {
    method: 'POST',
    headers: secret ? { authorization: `Bearer ${secret}` } : {},
  });
}

function makeDeps(over: Record<string, unknown> = {}) {
  const saved: Array<{ handle: string; patch: any }> = [];
  const deps = {
    secret: 'topsecret',
    today: () => '2026-06-27',
    listProjects: async () => [{ handle: 'lyma', url: 'https://lyma.life', name: 'LYMA' }],
    fetchSite: async () => 'site text',
    summarize: async () => 'A fresh summary.',
    saveDerived: async (handle: string, patch: any) => { saved.push({ handle, patch }); },
    ...over,
  };
  return { deps, saved };
}

describe('POST /api/refresh-knowledge', () => {
  it('rejects a request with no cron secret', async () => {
    const { deps } = makeDeps();
    expect((await createRefreshHandler(deps as any)(req())).status).toBe(401);
  });

  it('rejects a wrong secret', async () => {
    const { deps } = makeDeps();
    expect((await createRefreshHandler(deps as any)(req('nope'))).status).toBe(401);
  });

  it('writes a dated ok summary for a reachable site', async () => {
    const { deps, saved } = makeDeps();
    const res = await createRefreshHandler(deps as any)(req('topsecret'));
    expect(res.status).toBe(200);
    expect(saved).toHaveLength(1);
    expect(saved[0]).toEqual({
      handle: 'lyma',
      patch: { liveSummary: 'A fresh summary.', lastCheckedAt: '2026-06-27', status: 'ok' },
    });
  });

  it('marks a site unreachable without sending a liveSummary (so the prior one is kept)', async () => {
    const { deps, saved } = makeDeps({ fetchSite: async () => { throw new Error('timeout'); } });
    await createRefreshHandler(deps as any)(req('topsecret'));
    expect(saved[0].patch).toEqual({ lastCheckedAt: '2026-06-27', status: 'unreachable' });
    expect(saved[0].patch.liveSummary).toBeUndefined();
  });

  it('treats a summarize failure as unreachable', async () => {
    const { deps, saved } = makeDeps({ summarize: async () => { throw new Error('api down'); } });
    await createRefreshHandler(deps as any)(req('topsecret'));
    expect(saved[0].patch.status).toBe('unreachable');
  });
});
