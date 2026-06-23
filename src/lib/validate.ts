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
