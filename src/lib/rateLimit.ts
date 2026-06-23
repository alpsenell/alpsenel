import { createHash } from 'node:crypto';

export const PER_VISITOR = 10;
export const GLOBAL = 500;
const TTL_SECONDS = 26 * 60 * 60; // a bit over a day

export interface KvLike {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<unknown>;
}

export function getClientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}

function dayKey(now: Date): string {
  return now.toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}

function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

export async function checkRateLimit(
  kv: KvLike,
  ip: string,
  now: Date = new Date(),
): Promise<{ allowed: boolean; remaining: number; scope: 'ip' | 'global' | null }> {
  const day = dayKey(now);
  const ipKey = `rl:ip:${hashIp(ip)}:${day}`;
  const globalKey = `rl:global:${day}`;

  const ipCount = await kv.incr(ipKey);
  if (ipCount === 1) await kv.expire(ipKey, TTL_SECONDS);
  if (ipCount > PER_VISITOR) return { allowed: false, remaining: 0, scope: 'ip' };

  const gCount = await kv.incr(globalKey);
  if (gCount === 1) await kv.expire(globalKey, TTL_SECONDS);
  if (gCount > GLOBAL) return { allowed: false, remaining: 0, scope: 'global' };

  return { allowed: true, remaining: PER_VISITOR - ipCount, scope: null };
}
