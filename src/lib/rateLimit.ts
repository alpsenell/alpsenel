import { createHash } from 'node:crypto';

export const PER_VISITOR = 10;
export const GLOBAL = 500;
const TTL_SECONDS = 26 * 60 * 60; // a bit over a day

export interface RateLimitConfig {
  /** Key namespace so independent endpoints don't share a counter. */
  prefix: string;
  perVisitor: number;
  global: number;
}

// The /ask assistant: chatty, generous caps.
export const ASK_LIMIT: RateLimitConfig = { prefix: 'rl', perVisitor: PER_VISITOR, global: GLOBAL };
// The contact form: each send is an email to a human, so keep it tight.
export const CONTACT_LIMIT: RateLimitConfig = { prefix: 'rl:contact', perVisitor: 3, global: 80 };

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
  config: RateLimitConfig = ASK_LIMIT,
): Promise<{ allowed: boolean; remaining: number; scope: 'ip' | 'global' | null }> {
  const day = dayKey(now);
  const ipKey = `${config.prefix}:ip:${hashIp(ip)}:${day}`;
  const globalKey = `${config.prefix}:global:${day}`;

  const ipCount = await kv.incr(ipKey);
  if (ipCount === 1) await kv.expire(ipKey, TTL_SECONDS);
  if (ipCount > config.perVisitor) return { allowed: false, remaining: 0, scope: 'ip' };

  const gCount = await kv.incr(globalKey);
  if (gCount === 1) await kv.expire(globalKey, TTL_SECONDS);
  if (gCount > config.global) return { allowed: false, remaining: 0, scope: 'global' };

  return { allowed: true, remaining: config.perVisitor - ipCount, scope: null };
}
