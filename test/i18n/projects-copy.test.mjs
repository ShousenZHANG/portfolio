import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { en } from '../../src/i18n/en.js';
import { zh } from '../../src/i18n/zh.js';

// src/constants/projects.js reads each project's copy by index and field
// name, and ProjectDiagram renders every step; a missing field is a crash or
// a visible "undefined". Parity proves en and zh share a shape — this pins
// that shape to what the builder and the diagram actually read, and pins the
// numbers to the CV text the JD engine and E.D. are grounded in.

const LOCALES = [
  ['en', en, '../../public/cv/main.txt'],
  ['zh', zh, '../../public/cv/main.zh.txt'],
];

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

for (const [locale, dict, cvPath] of LOCALES) {
  const projects = dict.showcase.projects;

  test(`${locale}: three projects, each with copy and a drawable diagram`, () => {
    assert.equal(projects.length, 3);
    for (const proj of projects) {
      for (const key of ['title', 'meta', 'description']) {
        assert.ok(typeof proj[key] === 'string' && proj[key].length > 0, `${proj.title}: ${key}`);
      }
      assert.ok(braces(proj.description), `${proj.title}: unbalanced {highlight}`);
      assert.ok(proj.outcomes.length > 0, `${proj.title}: outcomes`);
      assert.equal(typeof proj.diagram.label, 'string');
      assert.ok(proj.diagram.steps.length >= 3, `${proj.title}: a pipeline needs steps`);
    }
  });

  test(`${locale}: diagram steps are well-formed and the run ends on the last step`, () => {
    for (const proj of projects) {
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

  test(`${locale}: every outcome number appears in that locale's CV text`, async () => {
    // Outcome figures are the claims a recruiter quotes back; each must be
    // traceable to the CV text the matcher and E.D. answer from.
    const cv = (await readFile(new URL(cvPath, import.meta.url), 'utf8')).replace(/\s/g, '');
    for (const proj of projects) {
      // The lead figure is the biggest number on the row — it needs a source
      // more than anything else does.
      assert.ok(cv.includes(proj.lead.value.replace(/\s/g, '')), `lead "${proj.lead.value}" of ${proj.title} is not in ${cvPath}`);
      for (const o of proj.outcomes) {
        for (const n of o.match(/\d+(?:\.\d+)?\s?(?:%|ms|\+)?/g) ?? []) {
          assert.ok(cv.includes(n.replace(/\s/g, '')), `"${n}" in "${o}" is not in ${cvPath}`);
        }
      }
    }
  });
}

test('en and zh tell the same numbers, project by project', () => {
  // Content parity, not just shape parity: a figure on one page and a
  // different figure on the other is the contradiction a bilingual recruiter
  // finds first.
  const nums = (p) => p.outcomes.join(' ').match(/\d+/g).sort().join(',');
  en.showcase.projects.forEach((p, i) => {
    assert.equal(nums(p), nums(zh.showcase.projects[i]), `project ${i}: ${p.title}`);
  });
  const counter = (d) => d.counter.items.map((it) => `${it.value}${it.suffix}`).join(',');
  assert.equal(counter(en), counter(zh), 'counter strip');
  const prs = (d) => d.oss.items.map((it) => `${it.repo}:${it.prs}:${it.stars}`).join(',');
  assert.equal(prs(en), prs(zh), 'open-source strip');
  const dates = (d) => d.experience.cards.map((c) => c.date.match(/\d{4}/g).join('-')).join(',');
  assert.equal(dates(en), dates(zh), 'experience years');
});
