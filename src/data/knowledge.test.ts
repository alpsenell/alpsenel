import { describe, it, expect } from 'vitest';
import { buildSystemPrompt, DEFAULT_KNOWLEDGE, type KnowledgeData } from './knowledge';

const TODAY = '2026-06-27';

describe('buildSystemPrompt', () => {
  it('includes the project names so the model can answer about them', () => {
    const p = buildSystemPrompt('en', DEFAULT_KNOWLEDGE, TODAY);
    expect(p).toContain('TESTERIFY');
    expect(p).toContain('VOLTA MOTOR');
    expect(p).toContain('LYMA');
  });

  it('instructs the model to answer in Turkish for tr', () => {
    expect(buildSystemPrompt('tr', DEFAULT_KNOWLEDGE, TODAY).toLowerCase()).toContain('turkish');
  });

  it('instructs the model to answer in English for en', () => {
    expect(buildSystemPrompt('en', DEFAULT_KNOWLEDGE, TODAY).toLowerCase()).toContain('english');
  });

  it("includes today's date so the model can answer time-relative questions", () => {
    expect(buildSystemPrompt('en', DEFAULT_KNOWLEDGE, TODAY)).toContain(TODAY);
  });

  it('includes the free-form facts so the model can reason over them', () => {
    const data: KnowledgeData = { ...DEFAULT_KNOWLEDGE, facts: 'Born 1995-04-12 in İzmir. Speaks Turkish and English.' };
    expect(buildSystemPrompt('en', data, TODAY)).toContain('Born 1995-04-12');
  });

  it('omits the facts section when facts is empty', () => {
    const data: KnowledgeData = { ...DEFAULT_KNOWLEDGE, facts: '' };
    expect(buildSystemPrompt('en', data, TODAY)).not.toContain('ADDITIONAL FACTS');
  });

  it('permits reasoning/inference over the facts rather than verbatim-only', () => {
    const p = buildSystemPrompt('en', DEFAULT_KNOWLEDGE, TODAY).toLowerCase();
    expect(p).toMatch(/reason|compute|combine|work out|derive/);
  });

  it('keeps the off-topic and anti-injection guardrails', () => {
    const p = buildSystemPrompt('en', DEFAULT_KNOWLEDGE, TODAY).toLowerCase();
    expect(p).toContain('decline');
    expect(p).toContain('ignore');
  });

  it('does not expose TODO placeholder text in the prompt', () => {
    expect(buildSystemPrompt('en', DEFAULT_KNOWLEDGE, TODAY).toUpperCase()).not.toContain('TODO:');
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
    const p = buildSystemPrompt('en', data, TODAY);
    expect(p).toContain('Authored brief.');
    expect(p).toContain('Live signal');
    expect(p).toContain('2026-06-27');
    expect(p).toContain('Currently featuring the Laser PRO launch.');
  });

  it('omits the live signal label when no project has a derived summary', () => {
    expect(buildSystemPrompt('en', DEFAULT_KNOWLEDGE, TODAY)).not.toContain('Live signal');
  });
});
