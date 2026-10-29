/// <reference types="node" />
// Lógica del compañero (Edge Function): validación, crisis y verificación de citas.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  cacheText,
  detectCrisis,
  findReferences,
  isCovered,
  quotedFragments,
  quoteIsInVerses,
  validateRequest,
} from '../../supabase/functions/companero/core';
import { books as appBooks } from '../src/lib/bible';

const books = appBooks.map((b) => ({ id: b.id, code: b.code.toUpperCase(), name: b.name }));
const refs = (t: string) =>
  findReferences(t, books).map((r) => `${books[r.bookId - 1].code} ${r.chapter}:${r.from}-${r.to}`);

test('valida lo que entra desde la app', () => {
  assert.deepEqual(validateRequest({ question: '  ¿Qué es la gracia?  ' }), {
    question: '¿Qué es la gracia?',
    history: [],
    country: null,
  });
  assert.ok('error' in validateRequest(null));
  assert.ok('error' in validateRequest({ question: 42 }));
  assert.ok('error' in validateRequest({ question: 'x' }));
  assert.ok('error' in validateRequest({ question: 'a'.repeat(501) }));
  assert.ok('error' in validateRequest({ question: 'hola', country: 'Argentina' }));
  assert.ok('error' in validateRequest({ question: 'hola', history: [{ role: 'system', content: 'x' }] }));
  assert.ok(
    'error' in
      validateRequest({
        question: 'hola',
        history: [
          { role: 'assistant', content: 'x' },
          { role: 'user', content: 'y' },
        ],
      }),
  );
  assert.ok('error' in validateRequest({ question: 'hola', history: [{ role: 'user', content: 'x' }] }));
  assert.ok(
    'error' in validateRequest({ question: 'hola', history: Array(8).fill({ role: 'user', content: 'x' }) }),
  );
  const ok = validateRequest({
    question: 'y eso?',
    history: [
      { role: 'user', content: 'pregunta' },
      { role: 'assistant', content: 'respuesta' },
    ],
    country: 'US',
  });
  assert.ok(!('error' in ok) && ok.history.length === 2 && ok.country === 'US');
});

test('detecta señales de crisis', () => {
  for (const t of [
    'Ya no quiero vivir',
    'pienso en suicidarme',
    'Quiero quitarme la vida',
    'a veces pienso en hacerme daño',
    'me quiero morir',
    'Mi esposo me pega',
  ]) {
    assert.ok(detectCrisis(t), t);
  }
  for (const t of [
    '¿Qué dice la Biblia sobre la muerte?',
    'Juan 11: la muerte de Lázaro',
    'cómo vivir con fe',
    'el suicidio de Judas en Mateo 27',
  ]) {
    // El último sí dispara: preferimos un falso positivo a perder una crisis real.
    assert.equal(detectCrisis(t), t.includes('suicidio'), t);
  }
});

test('encuentra las citas escritas en la respuesta', () => {
  assert.deepEqual(refs('Como dice Juan 3:16, Dios amó al mundo.'), ['JHN 3:16-16']);
  assert.deepEqual(refs('Ver 1 Juan 4:8 y también Juan 4:24.'), ['1JN 4:8-8', 'JHN 4:24-24']);
  assert.deepEqual(refs('En 1 Corintios 13:4-7 Pablo describe el amor.'), ['1CO 13:4-7']);
  assert.deepEqual(refs('El Salmo 23 y Salmos 91:1'), ['PSA 23:0-0', 'PSA 91:1-1']);
  assert.deepEqual(refs('Isaias 53:5 (sin acento) y Éxodo 20:3–17'), ['ISA 53:5-5', 'EXO 20:3-17']);
  assert.deepEqual(refs('Hechos 17:11'), ['ACT 17:11-11']);
  assert.deepEqual(refs('No hay citas acá, ni 3:16 suelto.'), []);
});

test('una cita mencionada tiene que estar verificada', () => {
  const verified = findReferences('Juan 3:16-18', books);
  assert.ok(isCovered(findReferences('Juan 3:17', books)[0], verified));
  assert.ok(isCovered(findReferences('Juan 3', books)[0], verified));
  assert.ok(!isCovered(findReferences('Juan 3:19', books)[0], verified));
  assert.ok(!isCovered(findReferences('Juan 4:1', books)[0], verified));
});

test('las comillas tienen que coincidir con el texto real', () => {
  const verso = 'Porque de tal manera amó Dios al mundo, que ha dado á su Hijo unigénito';
  const [q] = quotedFragments('Jesús dijo: «de tal manera amó Dios al mundo» y eso…');
  assert.ok(quoteIsInVerses(q, [verso]));
  const [inventada] = quotedFragments('Dice: "Dios ayuda a los que se ayudan" según algunos');
  assert.ok(!quoteIsInVerses(inventada, [verso]));
  assert.deepEqual(quotedFragments('una palabra "fe" corta no cuenta'), []);
});

test('la clave de caché ignora mayúsculas, acentos y signos', () => {
  assert.equal(cacheText('¿Qué es la GRACIA?'), cacheText('que es la gracia'));
});

test('la charla guardada se valida (si la tocan, la app no se rompe)', async () => {
  const { parseChat } = await import('../src/lib/chat-parse');
  const cit = { ref: 'Juan 3:16', code: 'jhn', chapter: 3, from: 16, to: 16, text: ['Porque…'] };
  const r = parseChat([
    { id: 'a', role: 'user', text: 'hola' },
    { id: 'b', role: 'assistant', text: 'resp', citations: [cit, { code: '../x' }, null, 'x'] },
    { id: 'c', role: 'assistant', text: 'sin citas', citations: 'no' },
    { role: 'system', text: 'x' },
    { id: 'd', role: 'user', text: 5 },
    null,
  ]);
  assert.equal(r.length, 3);
  assert.deepEqual(r[1], { id: 'b', role: 'assistant', text: 'resp', citations: [cit] });
  assert.deepEqual(r[2], { id: 'c', role: 'assistant', text: 'sin citas', citations: [] });
  assert.deepEqual(parseChat('x'), []);
});
