import test from 'node:test';
import assert from 'node:assert/strict';

import { buildPrompt, repairJson, callOpenAIJD, LLMError } from '../../../api/agents/_jd/llm.js';

// Fake OpenAI client whose create() throws a given error (or returns content).
const throwingClient = (err) => ({
  chat: { completions: { create: async () => { throw err; } } },
});
const respondingClient = (content) => ({
  chat: { completions: { create: async () => ({ choices: [{ message: { content } }] }) } },
});
const httpErr = (status) => Object.assign(new Error(`HTTP ${status}`), { status });

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

// ── callOpenAIJD error taxonomy ──────────────────────────────
// The security-relevant path: upstream failures must map to safe LLMError
// status + code and never leak the raw upstream message to the client.

test('callOpenAIJD throws missing_api_key when the key is unset', async () => {
  const prev = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    await assert.rejects(
      () => callOpenAIJD('jd', 'cv', respondingClient('{}')),
      (e) => e instanceof LLMError && e.code === 'missing_api_key' && e.status === 500
    );
  } finally {
    if (prev !== undefined) process.env.OPENAI_API_KEY = prev;
  }
});

test('callOpenAIJD maps 429 to rate_limited/429', async () => {
  process.env.OPENAI_API_KEY = 'test-key';
  await assert.rejects(
    () => callOpenAIJD('jd', 'cv', throwingClient(httpErr(429))),
    (e) => e instanceof LLMError && e.code === 'rate_limited' && e.status === 429
  );
});

test('callOpenAIJD maps a timeout to timeout/504', async () => {
  process.env.OPENAI_API_KEY = 'test-key';
  const timeoutErr = Object.assign(new Error('request timeout'), { name: 'APIConnectionTimeoutError' });
  await assert.rejects(
    () => callOpenAIJD('jd', 'cv', throwingClient(timeoutErr)),
    (e) => e instanceof LLMError && e.code === 'timeout' && e.status === 504
  );
});

test('callOpenAIJD maps 5xx to upstream_unavailable/503', async () => {
  process.env.OPENAI_API_KEY = 'test-key';
  await assert.rejects(
    () => callOpenAIJD('jd', 'cv', throwingClient(httpErr(500))),
    (e) => e instanceof LLMError && e.code === 'upstream_unavailable' && e.status === 503
  );
});

test('callOpenAIJD maps 401/403 to auth/500 (no upstream leak)', async () => {
  process.env.OPENAI_API_KEY = 'test-key';
  await assert.rejects(
    () => callOpenAIJD('jd', 'cv', throwingClient(httpErr(401))),
    (e) => e instanceof LLMError && e.code === 'auth' && e.status === 500 && !/HTTP 401/.test(e.message)
  );
});

test('callOpenAIJD maps unknown errors to connection/502', async () => {
  process.env.OPENAI_API_KEY = 'test-key';
  await assert.rejects(
    () => callOpenAIJD('jd', 'cv', throwingClient(new Error('ECONNRESET'))),
    (e) => e instanceof LLMError && e.code === 'connection' && e.status === 502
  );
});

test('callOpenAIJD throws bad_json/502 when the model returns non-JSON', async () => {
  process.env.OPENAI_API_KEY = 'test-key';
  await assert.rejects(
    () => callOpenAIJD('jd', 'cv', respondingClient('totally not json')),
    (e) => e instanceof LLMError && e.code === 'bad_json' && e.status === 502
  );
});

test('callOpenAIJD returns a parsed object on a valid JSON response', async () => {
  process.env.OPENAI_API_KEY = 'test-key';
  const out = await callOpenAIJD('jd', 'cv', respondingClient('{"overallScore":88}'));
  assert.equal(out.overallScore, 88);
});
