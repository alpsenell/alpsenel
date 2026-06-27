import { describe, it, expect } from 'vitest';
import { prepareAbout } from './aboutMarkdown';

describe('prepareAbout', () => {
  it('strips a single-line HTML comment but keeps the content', () => {
    const out = prepareAbout('Alp is a developer. <!-- note to self: add rates --> Based in İstanbul.');
    expect(out).not.toContain('note to self');
    expect(out).toContain('Alp is a developer.');
    expect(out).toContain('Based in İstanbul.');
  });

  it('strips multi-line comment blocks', () => {
    const raw = '# About\n<!--\nediting instructions\nrun push:about\n-->\nReal content here.';
    const out = prepareAbout(raw);
    expect(out).not.toContain('editing instructions');
    expect(out).not.toContain('push:about');
    expect(out).toContain('Real content here.');
  });

  it('returns an empty string when there is no real content (only comments/whitespace)', () => {
    expect(prepareAbout('   <!-- everything is a comment -->\n\n  ')).toBe('');
  });

  it('collapses excessive blank lines and trims the ends', () => {
    expect(prepareAbout('\n\n# Title\n\n\n\nBody\n\n')).toBe('# Title\n\nBody');
  });
});
