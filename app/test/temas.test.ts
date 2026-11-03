/// <reference types="node" />
// Temas: cada cita existe en la Reina-Valera 1909 de la app.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { TEMAS, getTema } from '../src/data/temas';
import { getBook, getChapter } from '../src/lib/bible';

test('cada tema apunta a versículos que existen', () => {
  assert.equal(new Set(TEMAS.map((t) => t.id)).size, TEMAS.length, 'ids repetidos');
  for (const t of TEMAS) {
    assert.ok(t.refs.length >= 4, `${t.id}: pocas citas`);
    for (const r of t.refs) {
      const where = `${t.id}: ${r.book} ${r.chapter}:${r.from}`;
      assert.ok(getBook(r.book), `${where} libro inexistente`);
      const ch = getChapter(r.book, r.chapter);
      assert.ok(ch, `${where} capítulo inexistente`);
      const to = r.to ?? r.from;
      assert.ok(r.from >= 1 && to >= r.from && to <= ch!.length, `${where} versículos fuera de rango`);
      assert.ok(to - r.from <= 4, `${where} demasiado largo`);
    }
  }
  assert.equal(getTema('paz')?.title, 'Paz');
  assert.equal(getTema('nada'), undefined);
});
