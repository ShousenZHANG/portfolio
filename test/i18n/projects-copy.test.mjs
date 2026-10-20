import test from 'node:test';
import assert from 'node:assert/strict';

import { en } from '../../src/i18n/en.js';
import { zh } from '../../src/i18n/zh.js';

// check-i18n-parity exempts showcase.projects: each locale shows its own
// projects, built by src/constants/projects.js. That module reads the copy by
// index and field name, so a missing field is a crash or a visible
// "undefined" — this pins each list to the shape its builder reads.

const braces = (s) => {
  // {highlight} markers must open and close in pairs, never nest.
  let depth = 0;
  for (const ch of s) {
    if (ch === '{') depth += 1;
    if (ch === '}') depth -= 1;
    if (depth < 0 || depth > 1) return false;
  }
  return depth === 0;
};

test('en: the carousel builder finds every alt it indexes', () => {
  const p = en.showcase.projects;
  assert.equal(p.length, 2);
  assert.equal(p[0].alts.length, 5, 'joblit has five slides');
  assert.equal(p[1].alts.length, 4, 'the contest platform has four slides');
  for (const key of ['title', 'description', 'sponsor', 'ctaLabel']) {
    assert.equal(typeof p[1].highlight[key], 'string', `highlight.${key}`);
  }
});

test('zh: three projects, each with copy and a drawable diagram', () => {
  const p = zh.showcase.projects;
  assert.equal(p.length, 3, 'one per project in the Chinese CV');
  for (const proj of p) {
    for (const key of ['title', 'meta', 'description']) {
      assert.ok(typeof proj[key] === 'string' && proj[key].length > 0, `${proj.title}: ${key}`);
    }
    assert.ok(braces(proj.description), `${proj.title}: unbalanced {highlight}`);
    assert.ok(proj.outcomes.length > 0, `${proj.title}: outcomes`);
    assert.equal(typeof proj.diagram.label, 'string');
    assert.ok(proj.diagram.steps.length >= 3, `${proj.title}: a pipeline needs steps`);
  }
});

test('zh: diagram steps are well-formed and the run ends on the last step', () => {
  for (const proj of zh.showcase.projects) {
    const steps = proj.diagram.steps;
    const titles = steps.map((s) => s.t);
    // Step titles are React keys.
    assert.equal(new Set(titles).size, titles.length, `${proj.title}: duplicate step`);
    steps.forEach((s, i) => {
      assert.ok(typeof s.t === 'string' && s.t.length > 0);
      if (s.chips) assert.ok(s.chips.length > 0 && new Set(s.chips).size === s.chips.length, `${s.t}: chips`);
      assert.equal(Boolean(s.end), i === steps.length - 1, `${proj.title}: only the last step is the output`);
    });
  }
});

test('zh: every outcome number appears in the Chinese CV text', async () => {
  // Outcome figures are the claims a recruiter quotes back; each one must be
  // traceable to the CV the page links for download.
  const { readFile } = await import('node:fs/promises');
  const cv = await readFile(new URL('../../public/cv/main.zh.txt', import.meta.url), 'utf8');
  const digits = (s) => cv.replace(/\s/g, '').includes(s.replace(/\s/g, ''));
  for (const proj of zh.showcase.projects) {
    for (const o of proj.outcomes) {
      for (const n of o.match(/\d+(?:\.\d+)?\s?(?:%|ms|\+)?/g) ?? []) {
        assert.ok(digits(n), `"${n}" in "${o}" is not in main.zh.txt`);
      }
    }
  }
});
