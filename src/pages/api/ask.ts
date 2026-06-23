import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';
import { Redis } from '@upstash/redis';
import { validateQuestion, type Lang } from '../../lib/validate';
import { checkRateLimit, getClientIp, type KvLike } from '../../lib/rateLimit';
import { buildSystemPrompt } from '../../data/knowledge';

export const prerender = false;

const MSG: Record<Lang, { invalid: string; limit: string; busy: string }> = {
  en: {
    invalid: 'Please enter a question (max 500 characters).',
    limit: "You've reached today's question limit. Please come back tomorrow.",
    busy: "I'm a bit busy right now — please try again in a moment.",
  },
  tr: {
    invalid: 'Lütfen bir soru yazın (en fazla 500 karakter).',
    limit: 'Bugünkü soru limitine ulaştın. Lütfen yarın tekrar dene.',
    busy: 'Şu an biraz yoğunum — birazdan tekrar dener misin?',
  },
};

function json(status: number, data: unknown): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
}

interface Deps {
  getRedis: () => KvLike;
  getAnthropic: () => { messages: { create: (args: any) => Promise<AsyncIterable<any>> } };
}

export function createAskHandler(deps: Deps) {
  return async function handle(request: Request): Promise<Response> {
    let body: unknown;
    try { body = await request.json(); } catch { return json(400, { error: 'bad', message: MSG.en.invalid }); }

    const v = validateQuestion(body);
    if (!v.ok) return json(400, { error: v.reason, message: MSG[v.lang].invalid });

    // Rate limit — fail closed if KV throws.
    let rl;
    try {
      rl = await checkRateLimit(deps.getRedis(), getClientIp(request));
    } catch {
      return json(503, { error: 'unavailable', message: MSG[v.lang].busy });
    }
    if (!rl.allowed) return json(429, { error: 'rate_limited', message: MSG[v.lang].limit, remaining: 0 });

    let stream: AsyncIterable<any>;
    try {
      stream = await deps.getAnthropic().messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 400,
        system: [{ type: 'text', text: buildSystemPrompt(v.lang), cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: v.question }],
        stream: true,
      });
    } catch {
      return json(503, { error: 'upstream', message: MSG[v.lang].busy });
    }

    const encoder = new TextEncoder();
    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        } catch {
          // Drop mid-stream errors; the client keeps whatever arrived.
        }
        controller.close();
      },
    });

    return new Response(readable, {
      status: 200,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'no-store',
        'x-ratelimit-remaining': String(rl.remaining),
      },
    });
  };
}

const handler = createAskHandler({
  getRedis: () => Redis.fromEnv() as unknown as KvLike,
  getAnthropic: () => new Anthropic({ timeout: 20000, maxRetries: 1 }) as any,
});

export const POST: APIRoute = ({ request }) => handler(request);
