import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { Redis } from '@upstash/redis';
import { validateContact, type ContactInput, type ContactReason, type Lang } from '../../lib/validate';
import { checkRateLimit, getClientIp, CONTACT_LIMIT, type KvLike } from '../../lib/rateLimit';

export const prerender = false;

// Inbox the form delivers to, and the verified-domain sender it comes from.
// Both default to alp@testerify.com (testerify.com is verified in Resend);
// the visitor's address goes into replyTo so a reply reaches them directly.
const TO = process.env.CONTACT_TO_EMAIL || 'alp@testerify.com';
const FROM = process.env.CONTACT_FROM_EMAIL || 'Alp Senel <alp@testerify.com>';

type Copy = {
  invalid: Record<ContactReason, string>;
  limit: string;
  busy: string;
  failed: string;
  sent: string;
};

const MSG: Record<Lang, Copy> = {
  en: {
    invalid: {
      name: 'Please enter your name.',
      email: 'Please enter a valid email address.',
      message: 'Please write a message of at least 15 characters.',
      bad: 'Please check the form and try again.',
    },
    limit: "You've sent a few messages already — please try again tomorrow.",
    busy: "Something's busy on my end — please try again in a moment.",
    failed: "I couldn't send your message just now. Please try again shortly.",
    sent: 'Message sent — thanks, I’ll get back to you soon.',
  },
  tr: {
    invalid: {
      name: 'Lütfen adını yaz.',
      email: 'Lütfen geçerli bir e-posta adresi yaz.',
      message: 'Lütfen en az 15 karakterlik bir mesaj yaz.',
      bad: 'Lütfen formu kontrol edip tekrar dene.',
    },
    limit: 'Zaten birkaç mesaj gönderdin — lütfen yarın tekrar dene.',
    busy: 'Şu an bir yoğunluk var — birazdan tekrar dener misin?',
    failed: 'Mesajını şu an gönderemedim. Lütfen birazdan tekrar dene.',
    sent: 'Mesaj gönderildi — teşekkürler, en kısa sürede döneceğim.',
  },
};

function json(status: number, data: unknown): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
}

function renderText(d: ContactInput): string {
  return `New message from your portfolio contact form\n\nName:  ${d.name}\nEmail: ${d.email}\n\n${d.message}\n`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
}

function renderHtml(d: ContactInput): string {
  const msg = escapeHtml(d.message).replace(/\n/g, '<br />');
  return `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#0c0e12">
  <p style="margin:0 0 16px;color:#666">New message from your portfolio contact form</p>
  <p style="margin:0 0 4px"><strong>Name:</strong> ${escapeHtml(d.name)}</p>
  <p style="margin:0 0 16px"><strong>Email:</strong> <a href="mailto:${escapeHtml(d.email)}">${escapeHtml(d.email)}</a></p>
  <div style="padding:16px;border-left:3px solid #a3e635;background:#f6f7f9">${msg}</div>
</div>`;
}

interface ResendLike {
  emails: { send: (args: any) => Promise<{ error?: unknown } | unknown> };
}

interface Deps {
  getRedis: () => KvLike;
  getResend: () => ResendLike;
}

export function createContactHandler(deps: Deps) {
  return async function handle(request: Request): Promise<Response> {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return json(400, { error: 'bad', message: MSG.en.invalid.bad });
    }

    const v = validateContact(body);
    if (!v.ok) return json(400, { error: v.reason, message: MSG[v.lang].invalid[v.reason] });

    // Honeypot hit: silently accept so bots can't tell they were caught.
    if (v.trap) return json(200, { ok: true, message: MSG[v.lang].sent });

    // Rate limit — fail closed if KV throws.
    let rl;
    try {
      rl = await checkRateLimit(deps.getRedis(), getClientIp(request), new Date(), CONTACT_LIMIT);
    } catch {
      return json(503, { error: 'unavailable', message: MSG[v.lang].busy });
    }
    if (!rl.allowed) return json(429, { error: 'rate_limited', message: MSG[v.lang].limit });

    try {
      const result: any = await deps.getResend().emails.send({
        from: FROM,
        to: TO,
        replyTo: v.data.email,
        subject: `Portfolio contact — ${v.data.name}`,
        text: renderText(v.data),
        html: renderHtml(v.data),
      });
      // The SDK resolves (doesn't throw) on API-level errors — surface them too.
      if (result && result.error) return json(502, { error: 'send_failed', message: MSG[v.lang].failed });
    } catch {
      return json(502, { error: 'send_failed', message: MSG[v.lang].failed });
    }

    return json(200, { ok: true, message: MSG[v.lang].sent });
  };
}

const handler = createContactHandler({
  getRedis: () => Redis.fromEnv() as unknown as KvLike,
  getResend: () => new Resend(process.env.RESEND_API_KEY) as unknown as ResendLike,
});

export const POST: APIRoute = ({ request }) => handler(request);
