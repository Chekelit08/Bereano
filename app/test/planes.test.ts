/// <reference types="node" />
// Planes de lectura: cada pasaje existe y cada día tiene su pregunta.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getPlan, PLANES } from '../src/data/planes';
import { getBook, getChapter } from '../src/lib/bible';
import { planProgress } from '../src/lib/planes';

test('cada plan y cada día apuntan a pasajes que existen', () => {
  assert.equal(new Set(PLANES.map((p) => p.id)).size, PLANES.length, 'ids repetidos');
  for (const p of PLANES) {
    assert.ok(p.days.length >= 7, `${p.id}: pocos días`);
    p.days.forEach((d, i) => {
      assert.ok(d.title && /[?.]$/.test(d.focus), `${p.id} día ${i + 1}: título o pregunta`);
      assert.ok(d.readings.length > 0, `${p.id} día ${i + 1}: sin lectura`);
      for (const r of d.readings) {
        assert.ok(getBook(r.book), `${p.id} día ${i + 1}: libro ${r.book}`);
        const verses = getChapter(r.book, r.chapter);
        assert.ok(verses, `${p.id} día ${i + 1}: ${r.book} ${r.chapter}`);
        if (r.from) {
          const to = r.to ?? r.from;
          assert.ok(
            r.from >= 1 && to >= r.from && to <= verses.length,
            `${p.id} día ${i + 1}: ${r.book} ${r.chapter}:${r.from}-${to}`,
          );
        }
      }
    });
  }
  assert.equal(getPlan('juan')?.days.length, 21);
  assert.equal(getPlan('juan')?.premium, false);
});

test('progreso de un plan', () => {
  const plan = getPlan('ansiedad')!;
  assert.deepEqual(planProgress(plan, undefined), {
    started: false,
    done: 0,
    total: 7,
    next: 0,
    finished: false,
  });
  assert.deepEqual(planProgress(plan, { start: '2026-10-28', done: [0, 1] }), {
    started: true,
    done: 2,
    total: 7,
    next: 2,
    finished: false,
  });
  assert.deepEqual(planProgress(plan, { start: '2026-10-28', done: [0, 2] }), {
    started: true,
    done: 2,
    total: 7,
    next: 1,
    finished: false,
  });
  const all = { start: '2026-10-28', done: [0, 1, 2, 3, 4, 5, 6] };
  assert.equal(planProgress(plan, all).finished, true);
});

test('la Biblia en un año: 365 días y cada capítulo una sola vez, en orden', async () => {
  const { getPlan } = await import('../src/data/planes');
  const { books } = await import('../src/lib/bible');
  const plan = getPlan('biblia-anio')!;
  assert.equal(plan.days.length, 365);
  const all = plan.days.flatMap((d) => d.readings.map((r) => `${r.book}.${r.chapter}`));
  const expected = books.flatMap((b) => Array.from({ length: b.chapters }, (_, i) => `${b.code}.${i + 1}`));
  assert.equal(all.length, 1189);
  assert.deepEqual(all, expected);
  for (const d of plan.days) assert.ok(d.readings.length >= 3 && d.readings.length <= 4, d.title);
  assert.equal(plan.days[0].title, 'Génesis 1–3');
});
