import { describe, it, expect } from 'vitest';
import { buildSystemPrompt, DEFAULT_KNOWLEDGE, type KnowledgeData } from './knowledge';

describe('buildSystemPrompt', () => {
  it('includes the project names so the model can answer about them', () => {
    const p = buildSystemPrompt('en', DEFAULT_KNOWLEDGE);
    expect(p).toContain('TESTERIFY');
    expect(p).toContain('VOLTA MOTOR');
    expect(p).toContain('LYMA');
  });

  it('instructs the model to answer in Turkish for tr', () => {
    expect(buildSystemPrompt('tr', DEFAULT_KNOWLEDGE).toLowerCase()).toContain('turkish');
  });

  it('instructs the model to answer in English for en', () => {
    expect(buildSystemPrompt('en', DEFAULT_KNOWLEDGE).toLowerCase()).toContain('english');
  });

  it('contains the off-topic and anti-injection guardrails', () => {
    const p = buildSystemPrompt('en', DEFAULT_KNOWLEDGE).toLowerCase();
    expect(p).toContain('decline');
    expect(p).toContain('ignore');
  });

  it('does not expose TODO placeholder text in the prompt', () => {
    const p = buildSystemPrompt('en', DEFAULT_KNOWLEDGE);
    expect(p.toUpperCase()).not.toContain('TODO:');
  });

  it('renders a dated live signal when a project has a derived summary', () => {
    const data: KnowledgeData = {
      ...DEFAULT_KNOWLEDGE,
      projects: [
        {
          num: '01',
          name: 'LYMA',
          year: '2024 — today',
          url: 'https://lyma.life/',
          handle: 'lyma',
          tech: ['Shopify Plus'],
          brief: { en: 'Authored brief.', tr: 'Yazılı özet.' },
          derived: { liveSummary: 'Currently featuring the Laser PRO launch.', lastCheckedAt: '2026-06-27' },
        },
      ],
    };
    const p = buildSystemPrompt('en', data);
    expect(p).toContain('Authored brief.'); // hand-written copy still present
    expect(p).toContain('Live signal'); // labeled as a live note
    expect(p).toContain('2026-06-27'); // dated
    expect(p).toContain('Currently featuring the Laser PRO launch.');
  });

  it('omits the live signal label when no project has a derived summary', () => {
    expect(buildSystemPrompt('en', DEFAULT_KNOWLEDGE)).not.toContain('Live signal');
  });
});
