import test from 'node:test';
import assert from 'node:assert/strict';

import { buildPrompt, repairJson } from '../../../api/agents/_jd/llm.js';

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

test('buildPrompt includes the visa candidate rule', () => {
  const prompt = buildPrompt('JD', 'CV');
  assert.ok(prompt.includes('485 Graduate Visa'));
  assert.ok(prompt.includes('4 Sep 2027'));
});

// ── repairJson ───────────────────────────────────────────────

test('repairJson parses clean JSON', () => {
  const obj = repairJson('{"a":1,"b":"x"}');
  assert.deepEqual(obj, { a: 1, b: 'x' });
});

test('repairJson strips ```json fences', () => {
  const obj = repairJson('```json\n{"a":1}\n```');
  assert.deepEqual(obj, { a: 1 });
});

test('repairJson strips bare ``` fences', () => {
  const obj = repairJson('```\n{"a":1}\n```');
  assert.deepEqual(obj, { a: 1 });
});

test('repairJson extracts JSON from surrounding prose', () => {
  const obj = repairJson('Here is the result: {"a":1,"b":2} cheers');
  assert.deepEqual(obj, { a: 1, b: 2 });
});

test('repairJson throws on completely invalid input', () => {
  assert.throws(() => repairJson('not json at all'), /not valid JSON/);
});

test('repairJson handles empty input as empty object', () => {
  const obj = repairJson('');
  assert.deepEqual(obj, {});
});
