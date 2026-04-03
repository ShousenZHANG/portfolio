import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildPrompt,
  clampScore,
  normalizeDimensionScores,
  deriveAtsScore,
  deriveConfidenceScore,
  deriveFitLabel,
  patchFitTexts,
} from '../../api/agents/jd.js';

// ── buildPrompt ──────────────────────────────────────────────

test('buildPrompt requests detailed scoring fields', () => {
  const prompt = buildPrompt('JD text', 'CV text');
  assert.ok(prompt.includes('"dimensionScores"'));
  assert.ok(prompt.includes('"confidenceScore"'));
  assert.ok(prompt.includes('"evidencePairs"'));
  assert.ok(prompt.includes('"riskFlags"'));
});

test('buildPrompt includes JD and CV text', () => {
  const prompt = buildPrompt('Senior React Developer', 'Eddy Zhang CV');
  assert.ok(prompt.includes('Senior React Developer'));
  assert.ok(prompt.includes('Eddy Zhang CV'));
});

// ── clampScore ───────────────────────────────────────────────

test('clampScore clamps to 0-100 range', () => {
  assert.equal(clampScore(50), 50);
  assert.equal(clampScore(-10), 0);
  assert.equal(clampScore(150), 100);
  assert.equal(clampScore(0), 0);
  assert.equal(clampScore(100), 100);
});

test('clampScore handles non-number inputs', () => {
  assert.equal(clampScore(NaN), 0);
  assert.equal(clampScore(undefined), 0);
  assert.equal(clampScore(null), 0);
  assert.equal(clampScore('abc'), 0);
});

// ── normalizeDimensionScores ─────────────────────────────────

test('normalizeDimensionScores returns provided values when present', () => {
  const result = normalizeDimensionScores({
    dimensionScores: { techStack: 80, responsibilities: 70, domainContext: 60, seniority: 50, tooling: 40 },
  });
  assert.equal(result.techStack, 80);
  assert.equal(result.responsibilities, 70);
  assert.equal(result.domainContext, 60);
  assert.equal(result.seniority, 50);
  assert.equal(result.tooling, 40);
});

test('normalizeDimensionScores uses fallbacks when dimensions missing', () => {
  const result = normalizeDimensionScores({
    exactMatchScore: 70,
    relatedMatchScore: 50,
  });
  assert.equal(result.techStack, 70); // fallback to exact
  assert.equal(result.domainContext, 50); // fallback to related
  assert.equal(result.responsibilities, 60); // (70+50)/2
});

test('normalizeDimensionScores handles empty data', () => {
  const result = normalizeDimensionScores({});
  assert.equal(result.techStack, 0);
  assert.equal(result.responsibilities, 0);
  assert.equal(result.domainContext, 0);
  assert.equal(result.seniority, 0);
  assert.equal(result.tooling, 0);
});

// ── deriveAtsScore ───────────────────────────────────────────

test('deriveAtsScore computes weighted formula correctly', () => {
  const score = deriveAtsScore({
    exactMatchScore: 80,
    relatedMatchScore: 60,
    gapScore: 10,
    matchedKeywords: ['java', 'spring', 'react'],
    missingKeywords: ['aws'],
    dimensionScores: { techStack: 80, responsibilities: 70, domainContext: 60, seniority: 70, tooling: 60 },
    eligibility: { visa: { status: 'OK' }, experience: { status: 'OK' }, location: { status: 'OK' } },
  });
  assert.ok(score >= 50 && score <= 100, `expected 50-100, got ${score}`);
});

test('deriveAtsScore applies visa issue penalty (-35, cap 35)', () => {
  const score = deriveAtsScore({
    exactMatchScore: 90,
    relatedMatchScore: 80,
    gapScore: 5,
    matchedKeywords: ['java', 'spring'],
    missingKeywords: [],
    dimensionScores: { techStack: 90, responsibilities: 85, domainContext: 80, seniority: 80, tooling: 75 },
    eligibility: { visa: { status: 'Issue' }, experience: { status: 'OK' }, location: { status: 'OK' } },
  });
  assert.ok(score <= 35, `visa issue should cap at 35, got ${score}`);
});

test('deriveAtsScore applies experience issue penalty (-25, cap 35)', () => {
  const score = deriveAtsScore({
    exactMatchScore: 85,
    relatedMatchScore: 70,
    gapScore: 10,
    matchedKeywords: ['java'],
    missingKeywords: [],
    dimensionScores: { techStack: 80, responsibilities: 70, domainContext: 60, seniority: 50, tooling: 60 },
    eligibility: { visa: { status: 'OK' }, experience: { status: 'Issue' }, location: { status: 'OK' } },
  });
  assert.ok(score <= 35, `exp issue should cap at 35, got ${score}`);
});

test('deriveAtsScore applies location issue penalty (-10, cap 75)', () => {
  const score = deriveAtsScore({
    exactMatchScore: 90,
    relatedMatchScore: 80,
    gapScore: 5,
    matchedKeywords: ['java', 'spring', 'docker'],
    missingKeywords: [],
    dimensionScores: { techStack: 90, responsibilities: 85, domainContext: 80, seniority: 80, tooling: 75 },
    eligibility: { visa: { status: 'OK' }, experience: { status: 'OK' }, location: { status: 'Issue' } },
  });
  assert.ok(score <= 75, `location issue should cap at 75, got ${score}`);
});

test('deriveAtsScore handles combined visa + experience issues', () => {
  const score = deriveAtsScore({
    exactMatchScore: 90,
    relatedMatchScore: 80,
    matchedKeywords: ['java'],
    missingKeywords: [],
    eligibility: { visa: { status: 'Issue' }, experience: { status: 'Issue' }, location: { status: 'OK' } },
  });
  assert.ok(score <= 35, `combined issues should cap at 35, got ${score}`);
});

test('deriveAtsScore handles all-zero data', () => {
  const score = deriveAtsScore({});
  assert.equal(score, 0);
});

test('deriveAtsScore handles all-100 data with no issues', () => {
  const score = deriveAtsScore({
    exactMatchScore: 100,
    relatedMatchScore: 100,
    gapScore: 0,
    matchedKeywords: Array(10).fill('skill'),
    missingKeywords: [],
    dimensionScores: { techStack: 100, responsibilities: 100, domainContext: 100, seniority: 100, tooling: 100 },
    eligibility: { visa: { status: 'OK' }, experience: { status: 'OK' }, location: { status: 'OK' } },
  });
  assert.ok(score >= 90, `perfect match should be >=90, got ${score}`);
});

// ── deriveConfidenceScore ────────────────────────────────────

test('deriveConfidenceScore penalizes hard eligibility issues', () => {
  const score = deriveConfidenceScore({
    eligibility: {
      visa: { status: 'Issue' },
      experience: { status: 'OK' },
      location: { status: 'OK' },
    },
    matchedKeywords: ['java', 'spring', 'docker'],
    missingKeywords: ['citizenship'],
    evidencePairs: [
      { type: 'exact', jdText: 'Spring Boot', cvText: 'Spring Boot' },
      { type: 'related', jdText: 'AWS', cvText: 'Azure' },
    ],
  });
  assert.ok(score <= 40, `visa issue should cap confidence at 40, got ${score}`);
});

test('deriveConfidenceScore rewards good coverage and evidence', () => {
  const score = deriveConfidenceScore({
    eligibility: { visa: { status: 'OK' }, experience: { status: 'OK' }, location: { status: 'OK' } },
    matchedKeywords: ['java', 'spring', 'react', 'docker', 'typescript'],
    missingKeywords: [],
    evidencePairs: Array(5).fill({ type: 'exact', jdText: 'a', cvText: 'b' }),
    related: [{ name: 'a' }, { name: 'b' }],
  });
  assert.ok(score >= 70, `good coverage should give >=70, got ${score}`);
});

test('deriveConfidenceScore penalizes unknown statuses', () => {
  const highScore = deriveConfidenceScore({
    eligibility: { visa: { status: 'OK' }, experience: { status: 'OK' }, location: { status: 'OK' } },
    matchedKeywords: ['java'],
    missingKeywords: ['aws'],
  });
  const lowScore = deriveConfidenceScore({
    eligibility: { visa: { status: 'Unknown' }, experience: { status: 'Unknown' }, location: { status: 'Unknown' } },
    matchedKeywords: ['java'],
    missingKeywords: ['aws'],
  });
  assert.ok(lowScore < highScore, 'unknown statuses should reduce confidence');
});

// ── deriveFitLabel ───────────────────────────────────────────

test('deriveFitLabel returns Strong match for score >= 82', () => {
  assert.equal(deriveFitLabel({ eligibility: {} }, 82), 'Strong match');
  assert.equal(deriveFitLabel({ eligibility: {} }, 95), 'Strong match');
});

test('deriveFitLabel returns Good match for score 68-81', () => {
  assert.equal(deriveFitLabel({ eligibility: {} }, 68), 'Good match');
  assert.equal(deriveFitLabel({ eligibility: {} }, 81), 'Good match');
});

test('deriveFitLabel returns Possible match for score 50-67', () => {
  assert.equal(deriveFitLabel({ eligibility: {} }, 50), 'Possible match');
  assert.equal(deriveFitLabel({ eligibility: {} }, 67), 'Possible match');
});

test('deriveFitLabel returns Not a fit for score < 50', () => {
  assert.equal(deriveFitLabel({ eligibility: {} }, 49), 'Not a fit');
  assert.equal(deriveFitLabel({ eligibility: {} }, 0), 'Not a fit');
});

test('deriveFitLabel forces Not a fit on visa issue regardless of score', () => {
  assert.equal(deriveFitLabel({ eligibility: { visa: { status: 'Issue' } } }, 95), 'Not a fit');
});

test('deriveFitLabel forces Not a fit on experience issue regardless of score', () => {
  assert.equal(deriveFitLabel({ eligibility: { experience: { status: 'Issue' } } }, 90), 'Not a fit');
});

// ── patchFitTexts ────────────────────────────────────────────

test('patchFitTexts overrides headline on visa issue', () => {
  const { fitHeadline } = patchFitTexts({ eligibility: { visa: { status: 'Issue' } } }, 20);
  assert.ok(fitHeadline.includes('visa'), `should mention visa, got: ${fitHeadline}`);
});

test('patchFitTexts overrides headline on experience issue', () => {
  const { fitHeadline } = patchFitTexts({ eligibility: { experience: { status: 'Issue' } } }, 20);
  assert.ok(fitHeadline.includes('experience'), `should mention experience, got: ${fitHeadline}`);
});

test('patchFitTexts overrides headline on combined visa + experience issue', () => {
  const { fitHeadline } = patchFitTexts({
    eligibility: { visa: { status: 'Issue' }, experience: { status: 'Issue' } },
  }, 20);
  assert.ok(fitHeadline.includes('visa') && fitHeadline.includes('experience'));
});

test('patchFitTexts provides default headline when none exists', () => {
  const { fitHeadline } = patchFitTexts({ eligibility: {} }, 85);
  assert.ok(fitHeadline.includes('Strong'), `score 85 should get Strong headline, got: ${fitHeadline}`);
});

test('patchFitTexts preserves existing headline when no issues', () => {
  const { fitHeadline } = patchFitTexts({ fitHeadline: 'Custom headline', eligibility: {} }, 85);
  assert.equal(fitHeadline, 'Custom headline');
});

test('patchFitTexts provides default verdict when none exists', () => {
  const { fitVerdict } = patchFitTexts({ eligibility: {} }, 70);
  assert.ok(fitVerdict.length > 0, 'should provide a default verdict');
});
