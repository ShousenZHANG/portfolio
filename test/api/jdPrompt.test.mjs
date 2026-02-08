import test from 'node:test';
import assert from 'node:assert/strict';

import { buildPrompt, deriveConfidenceScore } from '../../api/agents/jd.js';

test('buildPrompt requests detailed scoring fields', () => {
  const prompt = buildPrompt('JD text', 'CV text');

  assert.ok(prompt.includes('"dimensionScores"'));
  assert.ok(prompt.includes('"confidenceScore"'));
  assert.ok(prompt.includes('"evidencePairs"'));
  assert.ok(prompt.includes('"riskFlags"'));
});

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

  assert.ok(score <= 40);
});
