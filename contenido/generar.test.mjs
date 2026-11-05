import assert from 'node:assert/strict';
import { test } from 'node:test';

import { MAX_PARRAFO, MAX_VERSO, TOTAL, calendario, carruselDevocional, carruselTema, verses } from './lib.mjs';

// Un año entero: recorre todos los temas y devocionales varias veces.
const anio = calendario(new Date(2026, 0, 1), 365).flatMap((d) => d.carruseles);

test('todos los temas y devocionales arman su carrusel', () => {
  const ids = new Set(anio.map((c) => c.id));
  assert.equal(ids.size, TOTAL.temas + TOTAL.devocionales);
});

test('14 días seguidos dan 28 carruseles distintos', () => {
  const ids = calendario(new Date(2026, 10, 5), 14).flatMap((d) => d.carruseles.map((c) => c.id));
  assert.equal(new Set(ids).size, 28);
});

test('el devocional es el mismo que muestra la app ese día', () => {
  // devocionalDelDia arranca el 1/1/2026 con el primero de la lista.
  assert.equal(carruselDevocional(new Date(2026, 0, 1)).id, 'devocional-pastor');
});

test('cada versículo existe y el texto entra en la lámina', () => {
  for (const c of anio) {
    for (const s of c.slides) {
      if (s.tipo === 'verso') {
        assert.ok(s.texto.length <= MAX_VERSO, `${c.id}: versículo muy largo (${s.texto.length})`);
        assert.match(s.cita, /^[1-3]?\s?\S.* \d+:\d+(–\d+)?$/);
      }
      if (s.tipo === 'parrafo') assert.ok(s.texto.length <= MAX_PARRAFO, `${c.id}: párrafo muy largo`);
    }
  }
});

test('un versículo que no existe hace fallar el generador', () => {
  assert.throws(() => verses('jhn', 3, 99), /No existe/);
});

test('el texto del posteo trae la cita, el llamado y hashtags', () => {
  const c = carruselTema(new Date(2026, 10, 5));
  assert.match(c.texto, /Reina-Valera 1909/);
  assert.match(c.texto, /link en la bio/);
  assert.match(c.texto, /#biblia/);
});
