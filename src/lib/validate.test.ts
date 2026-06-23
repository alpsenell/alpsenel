import { describe, it, expect } from 'vitest';
import { validateQuestion } from './validate';

describe('validateQuestion', () => {
  it('accepts a normal question and trims it', () => {
    const r = validateQuestion({ question: '  What is your stack?  ', lang: 'en' });
    expect(r).toEqual({ ok: true, question: 'What is your stack?', lang: 'en' });
  });

  it('defaults lang to en when missing or unknown', () => {
    const r = validateQuestion({ question: 'hi', lang: 'xx' });
    expect(r.ok && r.lang).toBe('en');
  });

  it('keeps tr lang', () => {
    const r = validateQuestion({ question: 'merhaba', lang: 'tr' });
    expect(r.ok && r.lang).toBe('tr');
  });

  it('rejects empty / whitespace questions', () => {
    expect(validateQuestion({ question: '   ', lang: 'tr' })).toEqual({ ok: false, lang: 'tr', reason: 'empty' });
  });

  it('rejects questions longer than 500 chars', () => {
    const long = 'a'.repeat(501);
    expect(validateQuestion({ question: long, lang: 'en' })).toEqual({ ok: false, lang: 'en', reason: 'too_long' });
  });

  it('rejects non-object / missing question', () => {
    expect(validateQuestion(null).ok).toBe(false);
    expect(validateQuestion({ lang: 'en' }).ok).toBe(false);
  });
});
