import test from 'node:test';
import assert from 'node:assert/strict';

import { transcribeClip } from '../../../api/agents/transcribe.js';
import { LLMError } from '../../../api/agents/_jd/llm.js';

const okClient = (text) => ({
  audio: { transcriptions: { create: async () => ({ text }) } },
});
const throwingClient = (err) => ({
  audio: { transcriptions: { create: async () => { throw err; } } },
});
const httpErr = (status) => Object.assign(new Error(`HTTP ${status}`), { status });
const clip = Buffer.from([1, 2, 3, 4]);

test('transcribeClip returns trimmed text', async () => {
  process.env.OPENAI_API_KEY = 'test-key';
  const out = await transcribeClip(clip, 'audio/webm', okClient('  hello there  '));
  assert.equal(out, 'hello there');
});

test('transcribeClip tolerates a missing text field', async () => {
  process.env.OPENAI_API_KEY = 'test-key';
  assert.equal(await transcribeClip(clip, 'audio/webm', okClient(undefined)), '');
});

test('transcribeClip throws missing_api_key without a key', async () => {
  const prev = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    await assert.rejects(
      () => transcribeClip(clip, 'audio/webm', okClient('x')),
      (e) => e instanceof LLMError && e.code === 'missing_api_key'
    );
  } finally {
    if (prev !== undefined) process.env.OPENAI_API_KEY = prev;
  }
});

test('transcribeClip maps 429 to rate_limited', async () => {
  process.env.OPENAI_API_KEY = 'test-key';
  await assert.rejects(
    () => transcribeClip(clip, 'audio/webm', throwingClient(httpErr(429))),
    (e) => e instanceof LLMError && e.code === 'rate_limited' && e.status === 429
  );
});

test('transcribeClip maps auth failures without leaking upstream detail', async () => {
  process.env.OPENAI_API_KEY = 'test-key';
  await assert.rejects(
    () => transcribeClip(clip, 'audio/webm', throwingClient(httpErr(401))),
    (e) => e instanceof LLMError && e.code === 'auth' && !/HTTP 401/.test(e.message)
  );
});

test('transcribeClip maps unknown failures to a typing nudge', async () => {
  process.env.OPENAI_API_KEY = 'test-key';
  await assert.rejects(
    () => transcribeClip(clip, 'audio/webm', throwingClient(new Error('boom'))),
    (e) => e instanceof LLMError && e.code === 'transcribe_failed' && /typing/i.test(e.message)
  );
});
