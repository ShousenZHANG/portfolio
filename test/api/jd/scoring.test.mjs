import test from 'node:test';
import assert from 'node:assert/strict';

import {
  clampScore,
  normalizeDimensionScores,
  deriveAtsScore,
  deriveConfidenceScore,
  deriveFitLabel,
  patchFitTexts,
  applyConfidenceCaps,
  scoreJD,
} from '../../../api/agents/_jd/scoring.js';

// ── eligibility caps on confidence (LLM value must not bypass) ──

test('scoreJD caps an LLM-supplied confidenceScore on a visa Issue', () => {
  const out = scoreJD({
    confidenceScore: 95,
    eligibility: { visa: { status: 'Issue' }, experience: { status: 'OK' }, location: { status: 'OK' } },
  });
  assert.ok(out.confidenceScore <= 40, `expected <=40, got ${out.confidenceScore}`);
});

test('scoreJD caps an LLM-supplied confidenceScore on an experience Issue', () => {
  const out = scoreJD({
    confidenceScore: 99,
    eligibility: { experience: { status: 'Issue' } },
  });
  assert.ok(out.confidenceScore <= 45, `expected <=45, got ${out.confidenceScore}`);
});

test('scoreJD keeps an LLM confidenceScore when eligibility is clean', () => {
  const out = scoreJD({
    confidenceScore: 88,
    eligibility: { visa: { status: 'OK' }, experience: { status: 'OK' }, location: { status: 'OK' } },
  });
  assert.equal(out.confidenceScore, 88);
});

test('applyConfidenceCaps is idempotent and clamps to 0-100', () => {
  const eligIssue = { eligibility: { visa: { status: 'Issue' } } };
  const once = applyConfidenceCaps(eligIssue, 95);
  assert.equal(applyConfidenceCaps(eligIssue, once), once);
  assert.equal(applyConfidenceCaps({}, 999), 100);
  assert.equal(applyConfidenceCaps({}, -5), 0);
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
  assert.equal(result.techStack, 70);
  assert.equal(result.domainContext, 50);
  assert.equal(result.responsibilities, 60);
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

test('deriveAtsScore caps at 35 on visa Issue', () => {
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

test('deriveAtsScore caps at 35 on experience Issue', () => {
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

test('deriveAtsScore caps at 75 on location Issue', () => {
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

test('deriveAtsScore handles combined visa + experience Issues', () => {
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

test('deriveAtsScore approaches 100 on perfect match without issues', () => {
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

test('deriveConfidenceScore caps confidence at 40 on visa Issue', () => {
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

test('deriveConfidenceScore penalizes Unknown statuses', () => {
  const high = deriveConfidenceScore({
    eligibility: { visa: { status: 'OK' }, experience: { status: 'OK' }, location: { status: 'OK' } },
    matchedKeywords: ['java'],
    missingKeywords: ['aws'],
  });
  const low = deriveConfidenceScore({
    eligibility: { visa: { status: 'Unknown' }, experience: { status: 'Unknown' }, location: { status: 'Unknown' } },
    matchedKeywords: ['java'],
    missingKeywords: ['aws'],
  });
  assert.ok(low < high, 'unknown statuses should reduce confidence');
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

test('deriveFitLabel forces Not a fit on visa Issue regardless of score', () => {
  assert.equal(deriveFitLabel({ eligibility: { visa: { status: 'Issue' } } }, 95), 'Not a fit');
});

test('deriveFitLabel forces Not a fit on experience Issue regardless of score', () => {
  assert.equal(deriveFitLabel({ eligibility: { experience: { status: 'Issue' } } }, 90), 'Not a fit');
});

// ── patchFitTexts ────────────────────────────────────────────

test('patchFitTexts overrides headline on visa Issue', () => {
  const { fitHeadline } = patchFitTexts({ eligibility: { visa: { status: 'Issue' } } }, 20);
  assert.ok(fitHeadline.includes('visa'), `should mention visa, got: ${fitHeadline}`);
});

test('patchFitTexts overrides headline on experience Issue', () => {
  const { fitHeadline } = patchFitTexts({ eligibility: { experience: { status: 'Issue' } } }, 20);
  assert.ok(fitHeadline.includes('experience'), `should mention experience, got: ${fitHeadline}`);
});

test('patchFitTexts overrides headline on combined visa + experience Issue', () => {
  const { fitHeadline } = patchFitTexts({
    eligibility: { visa: { status: 'Issue' }, experience: { status: 'Issue' } },
  }, 20);
  assert.ok(fitHeadline.includes('visa') && fitHeadline.includes('experience'));
});

test('patchFitTexts provides default headline when none exists', () => {
  const { fitHeadline } = patchFitTexts({ eligibility: {} }, 85);
  assert.ok(fitHeadline.includes('Strong'), `score 85 should get Strong headline, got: ${fitHeadline}`);
});

test('patchFitTexts preserves existing headline when no Issues', () => {
  const { fitHeadline } = patchFitTexts({ fitHeadline: 'Custom headline', eligibility: {} }, 85);
  assert.equal(fitHeadline, 'Custom headline');
});

test('patchFitTexts provides default verdict when none exists', () => {
  const { fitVerdict } = patchFitTexts({ eligibility: {} }, 70);
  assert.ok(fitVerdict.length > 0, 'should provide a default verdict');
});

// ── scoreJD (integration of pure scoring pipeline) ───────────

test('scoreJD produces a flat JDScore with no nested score field', () => {
  const result = scoreJD({
    exactMatchScore: 80,
    relatedMatchScore: 60,
    gapScore: 10,
    matchedKeywords: ['react', 'node'],
    missingKeywords: ['aws'],
    dimensionScores: { techStack: 80, responsibilities: 70, domainContext: 60, seniority: 70, tooling: 60 },
    eligibility: { visa: { status: 'OK' }, experience: { status: 'OK' }, location: { status: 'OK' } },
  });

  assert.equal(typeof result.overallScore, 'number');
  assert.equal(typeof result.exactMatchScore, 'number');
  assert.equal(typeof result.relatedMatchScore, 'number');
  assert.equal(typeof result.gapScore, 'number');
  assert.equal(typeof result.confidenceScore, 'number');
  assert.equal(result.score, undefined, 'flat shape — no nested score object');
  assert.equal(typeof result.fitLabel, 'string');
  assert.equal(typeof result.fitHeadline, 'string');
  assert.equal(typeof result.fitVerdict, 'string');
});

test('scoreJD recomputes overallScore — ignores LLM-supplied value', () => {
  const result = scoreJD({
    overallScore: 99,
    exactMatchScore: 0,
    relatedMatchScore: 0,
    gapScore: 0,
    matchedKeywords: [],
    missingKeywords: [],
    eligibility: { visa: { status: 'Unknown' }, experience: { status: 'Unknown' }, location: { status: 'Unknown' } },
  });
  assert.ok(result.overallScore < 50, `overallScore should be recomputed low, got ${result.overallScore}`);
});

test('scoreJD honors LLM-supplied confidenceScore when present', () => {
  const result = scoreJD({
    confidenceScore: 77,
    eligibility: { visa: { status: 'OK' }, experience: { status: 'OK' }, location: { status: 'OK' } },
  });
  assert.equal(result.confidenceScore, 77);
});

test('scoreJD enforces array limits', () => {
  const result = scoreJD({
    matchedKeywords: Array(50).fill('x'),
    missingKeywords: Array(50).fill('y'),
    riskFlags: Array(20).fill('r'),
    suggestions: Array(20).fill('s'),
  });
  assert.equal(result.matchedKeywords.length, 20);
  assert.equal(result.missingKeywords.length, 20);
  assert.equal(result.riskFlags.length, 10);
  assert.equal(result.suggestions.length, 10);
});

test('scoreJD truncates evidencePair text fields', () => {
  const longText = 'x'.repeat(500);
  const result = scoreJD({
    evidencePairs: [{ type: 'exact', jdText: longText, cvText: longText, note: longText }],
  });
  assert.equal(result.evidencePairs.length, 1);
  assert.ok(result.evidencePairs[0].jdText.length <= 180);
  assert.ok(result.evidencePairs[0].cvText.length <= 180);
  assert.ok(result.evidencePairs[0].note.length <= 220);
});

test('scoreJD handles empty / null input', () => {
  const fromEmpty = scoreJD({});
  assert.equal(fromEmpty.overallScore, 0);
  assert.deepEqual(fromEmpty.matchedKeywords, []);

  const fromNull = scoreJD(null);
  assert.equal(fromNull.overallScore, 0);

  const fromUndef = scoreJD(undefined);
  assert.equal(fromUndef.overallScore, 0);
});

test('scoreJD provides default Unknown eligibility when missing', () => {
  const result = scoreJD({});
  assert.equal(result.eligibility.visa.status, 'Unknown');
  assert.equal(result.eligibility.experience.status, 'Unknown');
  assert.equal(result.eligibility.location.status, 'Unknown');
});

test('scoreJD enforces visa Issue cap end-to-end', () => {
  const result = scoreJD({
    exactMatchScore: 100,
    relatedMatchScore: 100,
    matchedKeywords: ['a', 'b', 'c'],
    missingKeywords: [],
    dimensionScores: { techStack: 100, responsibilities: 100, domainContext: 100, seniority: 100, tooling: 100 },
    eligibility: { visa: { status: 'Issue' }, experience: { status: 'OK' }, location: { status: 'OK' } },
  });
  assert.ok(result.overallScore <= 35);
  assert.equal(result.fitLabel, 'Not a fit');
  assert.ok(result.fitHeadline.includes('visa'));
});
