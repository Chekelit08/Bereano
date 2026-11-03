/// <reference types="node" />
// Oración guiada: cada cita existe en la Biblia de la app.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { GUIDES, cleanVerse, getGuide } from '../src/data/oracion-guiada';
import { getChapter } from '../src/lib/bible';

test('cada paso con cita apunta a un versículo que existe', () => {
  assert.equal(new Set(GUIDES.map((g) => g.id)).size, GUIDES.length);
  assert.ok(
    GUIDES.some((g) => !g.premium),
    'tiene que haber una guía gratis',
  );
  for (const g of GUIDES) {
    assert.ok(g.steps.length >= 3, g.id);
    for (const s of g.steps) {
      assert.ok(s.seconds >= 20 && s.seconds <= 180, `${g.id}: ${s.title}`);
      if (!s.ref) continue;
      const text = getChapter(s.ref.book, s.ref.chapter)?.[s.ref.verse - 1];
      assert.ok(text, `${g.id}: ${s.ref.book} ${s.ref.chapter}:${s.ref.verse}`);
    }
  }
  assert.equal(getGuide('acts')?.premium, false);
});

test('se quita el título del salmo', () => {
  assert.equal(cleanVerse(getChapter('psa', 23)![0]), 'Jehová es mi pastor; nada me faltará.');
});
