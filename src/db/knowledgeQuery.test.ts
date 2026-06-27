import { describe, it, expect } from 'vitest';
import { rowsToKnowledge } from './knowledgeQuery';

const site = {
  bio: 'B',
  experience: 'E',
  skills: ['s1', 's2'],
  availability: 'A',
  flagshipProject: 'F',
  contactEmail: 'c@d.e',
};

const alpha = {
  sortOrder: 1,
  name: 'ALPHA',
  year: '2024',
  url: 'https://a',
  handle: 'a',
  tech: ['X', 'Y'],
  briefEn: 'a-en',
  briefTr: 'a-tr',
  derived: { liveSummary: 'live', lastCheckedAt: '2026-06-27' },
};

const gamma = {
  sortOrder: 12,
  name: 'GAMMA',
  year: '2025',
  url: 'https://g',
  handle: 'g',
  tech: ['T'],
  briefEn: 'g-en',
  briefTr: 'g-tr',
  derived: null,
};

describe('rowsToKnowledge', () => {
  it('maps the site-knowledge fields', () => {
    const k = rowsToKnowledge(site, []);
    expect(k.bio).toBe('B');
    expect(k.skills).toEqual(['s1', 's2']);
    expect(k.contactEmail).toBe('c@d.e');
    expect(k.projects).toEqual([]);
  });

  it('maps a project row into the KnowledgeProject shape', () => {
    const p = rowsToKnowledge(site, [alpha]).projects[0];
    expect(p.name).toBe('ALPHA');
    expect(p.brief).toEqual({ en: 'a-en', tr: 'a-tr' });
    expect(p.tech).toEqual(['X', 'Y']);
    expect(p.num).toBe('01'); // zero-padded sort order
    expect(p.derived).toEqual({ liveSummary: 'live', lastCheckedAt: '2026-06-27' });
  });

  it('zero-pads multi-digit sort orders correctly', () => {
    expect(rowsToKnowledge(site, [gamma]).projects[0].num).toBe('12');
  });

  it('omits derived when the column is null', () => {
    expect(rowsToKnowledge(site, [gamma]).projects[0].derived).toBeUndefined();
  });

  it('preserves the given row order', () => {
    const names = rowsToKnowledge(site, [alpha, gamma]).projects.map((p) => p.name);
    expect(names).toEqual(['ALPHA', 'GAMMA']);
  });
});
