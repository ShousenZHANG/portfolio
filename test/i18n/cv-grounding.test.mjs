import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { en } from '../../src/i18n/en.js';
import { zh } from '../../src/i18n/zh.js';
import { PERSONA } from '../../api/agents/_ask/persona.js';
import { PERSONA_ZH } from '../../api/agents/_ask/persona.zh.js';

// Each page answers to its own CV: every number the page states about Eddy
// must be one that CV states. The two CVs differ on purpose (the Corrs role
// is dated and titled differently in each), so a figure copied across
// languages fails here instead of shipping.

const LOCALES = [
  ['en', en, PERSONA, '../../public/cv/main.txt'],
  ['zh', zh, PERSONA_ZH, '../../public/cv/main.zh.txt'],
];

// 「10 余个」 is how a Chinese CV writes "10+".
const norm = (s) => s.replace(/[\s,~]/g, '').replace(/余个?/g, '+');
const NUMBER = /\d+(?:[.,]\d+)*(?:\s?(?:%|ms|k\+|\+|×))?/g;

function strings(node, out = []) {
  if (typeof node === 'string') out.push(node);
  else if (Array.isArray(node)) node.forEach((v) => strings(v, out));
  else if (node && typeof node === 'object') Object.values(node).forEach((v) => strings(v, out));
  return out;
}

// The sections that make claims about Eddy. The JD samples are invented job
// ads and the hero video labels describe the clip, so they stay out.
const claimText = (d) => [
  d.hero.lead,
  ...strings(d.counter.items.map((it) => `${it.value}${it.suffix} ${it.label}`)),
  // Per-repo PR counts are checked separately below: only the English CV
  // breaks the 100+ total down by repository.
  ...strings(d.oss.items.map((it) => `${it.stars} ${it.work}`)),
  ...strings(d.experience.cards.map((c) => [c.title, c.date, c.responsibilities])),
  ...strings(d.showcase.projects),
  ...strings(Object.values(d.skills.nodes).map((n) => n.used)),
];

for (const [locale, dict, persona, cvPath] of LOCALES) {
  test(`${locale}: every number the page states is in its own CV`, async () => {
    const cv = norm(await readFile(new URL(cvPath, import.meta.url), 'utf8'));
    for (const text of claimText(dict)) {
      for (const n of text.match(NUMBER) ?? []) {
        assert.ok(cv.includes(norm(n)), `"${n}" in "${text.slice(0, 80)}" is not in ${cvPath}`);
      }
    }
  });

  test(`${locale}: experience dates are the CV's dates`, async () => {
    const cv = norm(await readFile(new URL(cvPath, import.meta.url), 'utf8'));
    for (const card of dict.experience.cards) {
      for (const end of card.date.split('–')) {
        assert.ok(cv.includes(norm(end)), `date "${end.trim()}" of "${card.title}" is not in ${cvPath}`);
      }
    }
  });

  test(`${locale}: E.D. states no outcome percentage the CV does not`, async () => {
    const cv = norm(await readFile(new URL(cvPath, import.meta.url), 'utf8'));
    for (const pct of persona.match(/\d+(?:\.\d+)?%/g) ?? []) {
      assert.ok(cv.includes(pct), `persona states ${pct}, which ${cvPath} does not`);
    }
  });
}

test('each page dates the Corrs role the way its own CV does', () => {
  assert.equal(en.experience.cards[0].date, 'Mar 2026 – Jul 2026');
  assert.equal(zh.experience.cards[0].date, '2025.07 – 2026.09');
  assert.ok(PERSONA.includes('Mar 2026 – Jul 2026'));
  assert.ok(PERSONA_ZH.includes('2025.07–2026.09'));
});

test('per-repo PR counts come from the English CV, in both languages', async () => {
  // The Chinese CV states only the 100+ total; the breakdown both pages
  // show is the English CV's, and it must be the same on both.
  const cv = norm(await readFile(new URL('../../public/cv/main.txt', import.meta.url), 'utf8'));
  for (const dict of [en, zh]) {
    for (const it of dict.oss.items) {
      assert.ok(cv.includes(`${it.prs}PRs`), `${it.name}: ${it.prs} PRs is not in main.txt`);
    }
  }
  assert.deepEqual(en.oss.items.map((it) => it.prs), zh.oss.items.map((it) => it.prs));
});
