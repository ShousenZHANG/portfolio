import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeResult, formatEligibilityText, eligibilityStyle } from '../../src/lib/jd-normalize.js';

// ── normalizeResult ──────────────────────────────────────────

test('normalizeResult maps complete API response correctly', () => {
  const raw = {
    overallScore: 78.6,
    exactMatchScore: 82.3,
    relatedMatchScore: 65.1,
    gapScore: 12.7,
    confidenceScore: 71.9,
    dimensionScores: { techStack: 85, responsibilities: 70, domainContext: 60, seniority: 65, tooling: 55 },
    matchedKeywords: ['java', 'spring'],
    missingKeywords: ['aws'],
    evidencePairs: [{ type: 'exact', jdText: 'a', cvText: 'b' }],
    riskFlags: ['visa'],
    suggestions: ['learn aws'],
    summary: 'Good match',
    fitLabel: 'Good match',
    fitHeadline: 'Solid fit',
    fitVerdict: 'Aligned',
    eligibility: { visa: { status: 'OK', note: 'Full rights' }, experience: { status: 'OK' }, location: { status: 'OK' } },
  };

  const result = normalizeResult(raw);

  assert.equal(result.score.overall, 79);
  assert.equal(result.score.exact, 82);
  assert.equal(result.score.related, 65);
  assert.equal(result.score.gaps, 13);
  assert.equal(result.score.confidence, 72);
  assert.deepEqual(result.matched, ['java', 'spring']);
  assert.deepEqual(result.gaps, ['aws']);
  assert.equal(result.fitLabel, 'Good match');
  assert.equal(result.summary, 'Good match');
});

test('normalizeResult handles legacy score nested format', () => {
  const raw = {
    score: { overall: 75, exact: 80, related: 60, gaps: 10, confidence: 70 },
  };

  const result = normalizeResult(raw);
  assert.equal(result.score.overall, 75);
  assert.equal(result.score.exact, 80);
  assert.equal(result.score.confidence, 70);
});

test('normalizeResult defaults to 0 for missing scores', () => {
  const result = normalizeResult({});

  assert.equal(result.score.overall, 0);
  assert.equal(result.score.exact, 0);
  assert.equal(result.score.related, 0);
  assert.equal(result.score.gaps, 0);
  assert.equal(result.score.confidence, 0);
});

test('normalizeResult handles null/undefined input', () => {
  const result = normalizeResult(null);
  assert.equal(result.score.overall, 0);
  assert.deepEqual(result.matched, []);
  assert.equal(result.fitLabel, '');
});

test('normalizeResult normalizes eligibility object', () => {
  const result = normalizeResult({
    eligibility: {
      visa: { status: 'Issue', note: 'Citizenship required' },
    },
  });
  assert.equal(result.eligibility.visa.status, 'Issue');
  assert.equal(result.eligibility.experience, null);
  assert.equal(result.eligibility.location, null);
});

test('normalizeResult falls back matched from matchedKeywords', () => {
  const result = normalizeResult({ matchedKeywords: ['react', 'node'] });
  assert.deepEqual(result.matched, ['react', 'node']);
});

test('normalizeResult falls back gaps from missingKeywords', () => {
  const result = normalizeResult({ missingKeywords: ['aws'] });
  assert.deepEqual(result.gaps, ['aws']);
});

test('normalizeResult handles non-array riskFlags/suggestions', () => {
  const result = normalizeResult({ riskFlags: 'not an array', suggestions: null });
  assert.deepEqual(result.riskFlags, []);
  assert.deepEqual(result.suggestions, []);
});

// ── formatEligibilityText ────────────────────────────────────

test('formatEligibilityText formats complete item', () => {
  assert.equal(
    formatEligibilityText({ status: 'OK', note: 'Full work rights' }, 'Visa'),
    'Visa: OK (Full work rights)'
  );
});

test('formatEligibilityText handles missing note', () => {
  assert.equal(formatEligibilityText({ status: 'Issue' }, 'Visa'), 'Visa: Issue');
});

test('formatEligibilityText returns dash for null item', () => {
  assert.equal(formatEligibilityText(null, 'Visa'), '-');
  assert.equal(formatEligibilityText(undefined, 'Visa'), '-');
});

test('formatEligibilityText returns dash for missing status', () => {
  assert.equal(formatEligibilityText({ note: 'something' }, 'Visa'), '-');
});

// ── eligibilityStyle ─────────────────────────────────────────

test('eligibilityStyle returns correct styles for each status', () => {
  assert.equal(eligibilityStyle('OK').icon, '\u2714');
  assert.equal(eligibilityStyle('OK').color, 'text-emerald-300');
  assert.equal(eligibilityStyle('Issue').icon, '\u26A0');
  assert.equal(eligibilityStyle('Issue').color, 'text-amber-300');
  assert.equal(eligibilityStyle('Unknown').icon, '\u2022');
  assert.equal(eligibilityStyle('Unknown').color, 'text-neutral-300');
  assert.equal(eligibilityStyle(null).icon, '\u2022');
});
