import { describe, it, expect } from 'vitest';
import { buildSystemPrompt } from './knowledge';

describe('buildSystemPrompt', () => {
  it('includes the project names so the model can answer about them', () => {
    const p = buildSystemPrompt('en');
    expect(p).toContain('TESTERIFY');
    expect(p).toContain('VOLTA MOTOR');
  });

  it('instructs the model to answer in Turkish for tr', () => {
    expect(buildSystemPrompt('tr').toLowerCase()).toContain('turkish');
  });

  it('instructs the model to answer in English for en', () => {
    expect(buildSystemPrompt('en').toLowerCase()).toContain('english');
  });

  it('contains the off-topic and anti-injection guardrails', () => {
    const p = buildSystemPrompt('en').toLowerCase();
    expect(p).toContain('decline');
    expect(p).toContain('ignore');
  });
});
