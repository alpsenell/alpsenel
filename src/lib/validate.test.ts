import { describe, it, expect } from 'vitest';
import { validateQuestion, validateContact } from './validate';

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

describe('validateContact', () => {
  const good = { name: 'Alp', email: 'a@b.com', message: 'Hello there, I have a project.', lang: 'en' };

  it('accepts a valid submission and trims the fields', () => {
    const r = validateContact({ ...good, name: '  Alp  ', message: '  Hello there, I have a project.  ' });
    expect(r).toEqual({
      ok: true,
      data: { name: 'Alp', email: 'a@b.com', message: 'Hello there, I have a project.' },
      lang: 'en',
      trap: false,
    });
  });

  it('keeps the tr language', () => {
    const r = validateContact({ ...good, lang: 'tr' });
    expect(r.ok && r.lang).toBe('tr');
  });

  it('rejects an empty name', () => {
    const r = validateContact({ ...good, name: '   ' });
    expect(r).toMatchObject({ ok: false, reason: 'name' });
  });

  it('rejects an invalid email', () => {
    expect(validateContact({ ...good, email: 'not-an-email' })).toMatchObject({ ok: false, reason: 'email' });
    expect(validateContact({ ...good, email: 'a@b' })).toMatchObject({ ok: false, reason: 'email' });
  });

  it('rejects a too-short message', () => {
    const r = validateContact({ ...good, message: 'hi' });
    expect(r).toMatchObject({ ok: false, reason: 'message' });
  });

  it('counts non-space characters toward the message minimum', () => {
    // 14 real characters padded with spaces — still too short.
    expect(validateContact({ ...good, message: 'abcd efgh ijkl mn' })).toMatchObject({ ok: false, reason: 'message' });
    // Exactly 15 non-space characters spread across words — accepted.
    expect(validateContact({ ...good, message: 'hello there world' })).toMatchObject({ ok: true });
  });

  it('rejects a message over the max length', () => {
    const r = validateContact({ ...good, message: 'a'.repeat(3001) });
    expect(r).toMatchObject({ ok: false, reason: 'message' });
  });

  it('flags the honeypot as a trap but reports ok (silent drop)', () => {
    const r = validateContact({ ...good, company: 'Acme Corp' });
    expect(r).toMatchObject({ ok: true, trap: true });
  });

  it('rejects non-object / missing fields', () => {
    expect(validateContact(null).ok).toBe(false);
    expect(validateContact({ name: 'Alp', lang: 'en' }).ok).toBe(false);
  });
});
