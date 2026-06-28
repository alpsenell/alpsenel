export type Lang = 'en' | 'tr';

export type ValidateResult =
  | { ok: true; question: string; lang: Lang }
  | { ok: false; lang: Lang; reason: 'empty' | 'too_long' | 'bad' };

const MAX = 500;

function normLang(v: unknown): Lang {
  return v === 'tr' ? 'tr' : 'en';
}

export function validateQuestion(body: unknown): ValidateResult {
  if (!body || typeof body !== 'object') return { ok: false, lang: 'en', reason: 'bad' };
  const { question, lang } = body as Record<string, unknown>;
  const l = normLang(lang);
  if (typeof question !== 'string') return { ok: false, lang: l, reason: 'bad' };
  const q = question.trim();
  if (q.length === 0) return { ok: false, lang: l, reason: 'empty' };
  if (q.length > MAX) return { ok: false, lang: l, reason: 'too_long' };
  return { ok: true, question: q, lang: l };
}

// ---- contact form -------------------------------------------------------

export const CONTACT_LIMITS = {
  name: { min: 1, max: 80 },
  email: { max: 254 }, // RFC 5321 max length
  // `min` counts non-whitespace characters only — 15 real characters, spaces excluded.
  message: { min: 15, max: 3000 },
} as const;

// Characters that count toward the message minimum (everything but whitespace).
const countMessageChars = (s: string): number => s.replace(/\s/g, '').length;

// Pragmatic single-line email check — not RFC-exhaustive, but rejects the
// obvious junk while accepting anything a real person would type.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ContactInput {
  name: string;
  email: string;
  message: string;
}

export type ContactReason = 'name' | 'email' | 'message' | 'bad';

export type ValidateContactResult =
  // `trap` is true when the honeypot field was filled — a bot. The caller
  // should pretend success but skip sending anything.
  | { ok: true; data: ContactInput; lang: Lang; trap: boolean }
  | { ok: false; lang: Lang; reason: ContactReason };

export function validateContact(body: unknown): ValidateContactResult {
  if (!body || typeof body !== 'object') return { ok: false, lang: 'en', reason: 'bad' };
  const { name, email, message, lang, company } = body as Record<string, unknown>;
  const l = normLang(lang);

  // Honeypot: a hidden field real users never see. If anything landed in it,
  // treat the whole submission as a bot — short-circuit before validation.
  if (typeof company === 'string' && company.trim().length > 0) {
    return { ok: true, data: { name: '', email: '', message: '' }, lang: l, trap: true };
  }

  if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
    return { ok: false, lang: l, reason: 'bad' };
  }

  const n = name.trim();
  if (n.length < CONTACT_LIMITS.name.min || n.length > CONTACT_LIMITS.name.max) {
    return { ok: false, lang: l, reason: 'name' };
  }

  const e = email.trim();
  if (e.length > CONTACT_LIMITS.email.max || !EMAIL_RE.test(e)) {
    return { ok: false, lang: l, reason: 'email' };
  }

  const m = message.trim();
  if (countMessageChars(m) < CONTACT_LIMITS.message.min || m.length > CONTACT_LIMITS.message.max) {
    return { ok: false, lang: l, reason: 'message' };
  }

  return { ok: true, data: { name: n, email: e, message: m }, lang: l, trap: false };
}
