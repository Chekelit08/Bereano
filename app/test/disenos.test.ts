/// <reference types="node" />
// Diseños del versículo del día, compartir cualquier versículo y onboarding.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ALL_DESIGNS, DESIGN_STYLES, TONES, designsForDay } from '../src/data/disenos';
import { GOALS, GOAL_INFO, cleanName, parseGoals, recommendation } from '../src/data/onboarding';
import { getPlan } from '../src/data/planes';
import { MAX_SHARE_CHARS, sharePassage } from '../src/lib/compartir';

const day = (i: number) => new Date(2026, 0, 1 + i);

test('cada día trae 3 diseños distintos y válidos', () => {
  for (let i = 0; i < 400; i++) {
    const ds = designsForDay(day(i));
    assert.equal(ds.length, 3);
    assert.equal(new Set(ds.map((d) => d.style)).size, 3, `estilos repetidos el día ${i}`);
    for (const d of ds) {
      assert.ok(DESIGN_STYLES.some((s) => s.id === d.style));
      assert.ok(Number.isInteger(d.tone) && d.tone >= 0 && d.tone < TONES);
    }
  }
});

test('el mismo día da siempre lo mismo y dos días seguidos no se repiten', () => {
  assert.deepEqual(designsForDay(new Date(2026, 9, 29, 8)), designsForDay(new Date(2026, 9, 29, 23)));
  for (let i = 0; i < 400; i++) {
    const a = designsForDay(day(i)).map((d) => `${d.style}${d.tone}`);
    const b = designsForDay(day(i + 1)).map((d) => `${d.style}${d.tone}`);
    assert.notDeepEqual(a, b, `día ${i} igual al siguiente`);
  }
});

test('en un mes se ven todos los estilos', () => {
  const seen = new Set<string>();
  for (let i = 0; i < 30; i++) for (const d of designsForDay(day(i))) seen.add(d.style);
  assert.equal(seen.size, DESIGN_STYLES.length);
  assert.equal(ALL_DESIGNS.length, DESIGN_STYLES.length * TONES);
});

test('compartir un versículo: valida el pasaje que llega por la URL', () => {
  const ok = sharePassage({ book: 'jhn', chapter: '3', from: '16' });
  assert.equal(ok?.reference, 'Juan 3:16');
  assert.match(ok!.text, /^Porque de tal manera/);
  assert.equal(sharePassage({ book: 'jhn', chapter: '3', from: '16', to: '17' })?.reference, 'Juan 3:16-17');
  for (const bad of [
    { book: 'xxx', chapter: '1', from: '1' },
    { book: 'jhn', chapter: '99', from: '1' },
    { book: 'jhn', chapter: '3', from: '0' },
    { book: 'jhn', chapter: '3', from: '17', to: '16' },
    { book: 'jhn', chapter: '3', from: '1', to: '99' },
    { book: 'jhn', chapter: '3', from: '1', to: '9' }, // más de 5 versículos
    { book: 'jhn', chapter: '3', from: '1.5' },
  ])
    assert.equal(sharePassage(bad), null, JSON.stringify(bad));
  const long = sharePassage({ book: 'est', chapter: '8', from: '9' });
  assert.equal(long?.tooLong, long!.text.length > MAX_SHARE_CHARS);
});

test('onboarding: cada objetivo recomienda un plan que existe', () => {
  for (const g of GOALS) assert.ok(getPlan(GOAL_INFO[g].plan), g);
  assert.equal(recommendation([]).plan, 'juan');
  assert.equal(recommendation(['familia', 'paz']).plan, 'familia');
  assert.deepEqual(parseGoals(['paz', 'hackear', 3, 'familia']), ['paz', 'familia']);
  assert.deepEqual(parseGoals('paz'), []);
});

test('onboarding: el nombre se limpia y se recorta', () => {
  assert.equal(cleanName('  Ezequiel  '), 'Ezequiel');
  assert.equal(cleanName('María José'), 'María José');
  assert.equal(cleanName('<script>alert(1)</script>'), 'scriptalertscript');
  assert.equal(cleanName('a'.repeat(80)).length, 30);
  assert.equal(cleanName(42), '');
});
