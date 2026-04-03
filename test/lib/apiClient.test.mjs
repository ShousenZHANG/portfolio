import test from 'node:test';
import assert from 'node:assert/strict';

import { postJSON } from '../../src/lib/api-client.js';

test('postJSON throws on non-ok response with body text', async () => {
  // Mock fetch to simulate a 400 error
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: false,
    status: 400,
    text: async () => 'Bad request body',
  });

  try {
    await assert.rejects(
      () => postJSON('/api/test', { foo: 'bar' }),
      (err) => {
        assert.equal(err.message, 'Bad request body');
        return true;
      }
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('postJSON throws with status code when body is empty', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: false,
    status: 500,
    text: async () => '',
  });

  try {
    await assert.rejects(
      () => postJSON('/api/test', {}),
      (err) => {
        assert.equal(err.message, 'Request failed: 500');
        return true;
      }
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('postJSON returns parsed JSON on success', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, opts) => {
    // Verify correct request format
    assert.equal(opts.method, 'POST');
    assert.equal(opts.headers['Content-Type'], 'application/json');
    assert.equal(opts.body, JSON.stringify({ jd: 'test' }));

    return {
      ok: true,
      json: async () => ({ result: 'success' }),
    };
  };

  try {
    const data = await postJSON('/api/agents/jd', { jd: 'test' });
    assert.deepEqual(data, { result: 'success' });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
