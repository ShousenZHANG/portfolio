import test from 'node:test';
import assert from 'node:assert/strict';

import { SKILL_GRAPH, VIEWBOX } from '../../src/data/skillGraph.js';
import { en } from '../../src/i18n/en.js';
import { zh } from '../../src/i18n/zh.js';

// One graph, two dictionaries. Parity proves the two dictionaries carry the
// same keys; only this file proves those keys match the GRAPH — and that the
// labels, at their real rendered size in each language, fit.

const DICTS = { en, zh };

// Label geometry mirrors SkillsConstellation.jsx: fontSize 2.5, textAnchor
// middle, baseline at y + r*0.5 + 3.4. Advance widths were calibrated against
// getBBox() of the rendered Mona Sans labels: all-caps runs measured
// 0.74-0.78em per glyph, mixed-case labels 0.48-0.56em. Capitals at 0.7em and
// lowercase at 0.5em land within a few percent of every measured label, wide
// side on most. The vertical extent is the INK — cap height above the
// baseline, descender below — not getBBox's line box, which adds leading that
// never paints.
const FONT = 2.5;
const advance = (ch) => (/[A-Z]/.test(ch) ? 0.7 : /[a-z0-9]/.test(ch) ? 0.5 : ch === ' ' ? 0.25 : 0.35);
const labelBox = (n, label) => {
  const base = n.y + n.r * 0.5 + 3.4;
  const w = [...label].reduce((s, ch) => s + advance(ch), 0) * FONT;
  return { l: n.x - w / 2, r: n.x + w / 2, t: base - FONT * 0.75, b: base + FONT * 0.22 };
};
// Side bearings: a label may graze the viewBox edge by this much with no ink
// actually cut.
const EDGE_SLACK = 0.5;
// The idle halo is r*0.5; the ambient float drifts a node up to ~0.75 units.
const DRIFT = 0.8;
const discHits = (box, n) => {
  const rad = n.r * 0.5 + DRIFT;
  const cx = Math.max(box.l, Math.min(n.x, box.r));
  const cy = Math.max(box.t, Math.min(n.y, box.b));
  return Math.hypot(n.x - cx, n.y - cy) < rad;
};
// Label against label: no drift margin — every node floats along the same
// vector, so two labels never close on each other by the full drift.
const boxesHit = (a, b) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;

for (const [locale, dict] of Object.entries(DICTS)) {
  const graph = SKILL_GRAPH;
  const copy = dict.skills;
  const ids = graph.nodes.map((n) => n.id);
  const byId = Object.fromEntries(graph.nodes.map((n) => [n.id, n]));

  test(`${locale}: node ids are unique`, () => {
    assert.equal(new Set(ids).size, ids.length);
  });

  test(`${locale}: every node has a label and at least one evidence line`, () => {
    for (const id of ids) {
      const c = copy.nodes[id];
      assert.ok(c, `no copy for node "${id}"`);
      assert.equal(typeof c.label, 'string');
      assert.ok(Array.isArray(c.used) && c.used.length > 0, `node "${id}" proves nothing`);
    }
  });

  test(`${locale}: the dictionary carries no copy for a node the graph dropped`, () => {
    // A stale entry renders nowhere, so nothing else would ever notice it.
    for (const id of Object.keys(copy.nodes)) assert.ok(byId[id], `orphan copy "${id}"`);
  });

  test(`${locale}: categories line up between graph and dictionary`, () => {
    assert.deepEqual(Object.keys(graph.cats).sort(), Object.keys(copy.cats).sort());
    for (const n of graph.nodes) assert.ok(graph.cats[n.cat], `node "${n.id}" has unknown cat "${n.cat}"`);
  });

  test(`${locale}: every edge joins two existing, distinct nodes, once`, () => {
    const seen = new Set();
    for (const [a, b] of graph.edges) {
      assert.ok(byId[a] && byId[b], `edge ${a}-${b} dangles`);
      assert.notEqual(a, b);
      const key = [a, b].sort().join('|');
      assert.ok(!seen.has(key), `duplicate edge ${key}`);
      seen.add(key);
    }
  });

  test(`${locale}: every node is reachable — nothing floats unconnected`, () => {
    const linked = new Set(graph.edges.flat());
    for (const id of ids) assert.ok(linked.has(id), `node "${id}" has no edges`);
  });

  test(`${locale}: every node and label sits inside the viewBox`, () => {
    for (const n of graph.nodes) {
      const box = labelBox(n, copy.nodes[n.id].label);
      assert.ok(n.x - n.r * 0.62 >= 0 && n.x + n.r * 0.62 <= VIEWBOX.w, `${n.id} disc clipped`);
      assert.ok(n.y - n.r * 0.62 - DRIFT >= 0, `${n.id} disc clipped at top`);
      assert.ok(box.l >= -EDGE_SLACK && box.r <= VIEWBOX.w + EDGE_SLACK, `${n.id} label clipped horizontally`);
      assert.ok(box.b <= VIEWBOX.h, `${n.id} label clipped at bottom`);
    }
  });

  test(`${locale}: no label overlaps another label or another node`, () => {
    const boxes = graph.nodes.map((n) => [n, labelBox(n, copy.nodes[n.id].label)]);
    for (const [n, box] of boxes) {
      for (const [m, other] of boxes) {
        if (m === n) continue;
        assert.ok(!discHits(box, m), `label "${copy.nodes[n.id].label}" covers node "${m.id}"`);
        if (m.id > n.id) {
          assert.ok(!boxesHit(box, other), `labels "${copy.nodes[n.id].label}" and "${copy.nodes[m.id].label}" collide`);
        }
      }
    }
  });
}
