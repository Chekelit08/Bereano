/// <reference types="node" />
// Ningún devocional puede citar algo que no esté en la Biblia: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { DEVOCIONALES, devocionalDelDia, shareRange, shareText } from '../src/data/devocionales';
import { findSequence, MARKS } from '../src/data/marcas';
import { getBook, getChapter } from '../src/lib/bible';

test('cada devocional apunta a un pasaje que existe', () => {
  assert.ok(DEVOCIONALES.length >= 31);
  assert.equal(new Set(DEVOCIONALES.map((d) => d.id)).size, DEVOCIONALES.length, 'ids repetidos');
  for (const d of DEVOCIONALES) {
    const book = getBook(d.book);
    assert.ok(book, `${d.id}: libro ${d.book}`);
    const verses = getChapter(d.book, d.chapter);
    assert.ok(verses, `${d.id}: capítulo ${d.chapter}`);
    assert.ok(
      d.from >= 1 && d.from <= d.to && d.to <= verses.length,
      `${d.id}: versículos ${d.from}-${d.to}`,
    );
    assert.ok(d.title && d.reflection && /[?.]$/.test(d.question), `${d.id}: textos`);
  }
});

test('todo lo citado entre «» está textual en el pasaje', () => {
  for (const d of DEVOCIONALES) {
    const passage = getChapter(d.book, d.chapter)!
      .slice(d.from - 1, d.to)
      .join(' ');
    const quotes = [...d.reflection.matchAll(/«([^»]+)»/g)].map((m) => m[1]);
    assert.ok(quotes.length > 0, `${d.id}: no cita el pasaje`);
    for (const q of quotes) assert.ok(passage.includes(q), `${d.id}: «${q}» no está en el pasaje`);
  }
});

test('el devocional del día rota y es estable', () => {
  const a = devocionalDelDia(new Date(2026, 9, 28, 8));
  assert.equal(a.id, devocionalDelDia(new Date(2026, 9, 28, 23)).id);
  assert.notEqual(a.id, devocionalDelDia(new Date(2026, 9, 29, 8)).id);
});

test('la imagen para compartir usa versículos del pasaje y entra en la historia', () => {
  for (const d of DEVOCIONALES) {
    const [a, b] = shareRange(d);
    assert.ok(a >= d.from && b <= d.to && a <= b, `${d.id}: share fuera del pasaje`);
    const text = shareText(getChapter(d.book, d.chapter)!.slice(a - 1, b));
    assert.ok(
      !/^(Salmo|Al Músico|Cántico|Masquil|Oración|Mictam)/.test(text),
      `${d.id}: empieza con un título`,
    );
    assert.ok(!text.includes('Selah'), `${d.id}: incluye Selah`);
    assert.ok(text.length <= 260, `${d.id}: ${text.length} caracteres para la imagen`);
  }
});

test('las marcas del diseño Editorial existen en el texto', () => {
  for (const d of DEVOCIONALES) {
    const m = MARKS[d.id];
    assert.ok(m, `${d.id}: sin marcas`);
    const [a, b] = shareRange(d);
    const words = shareText(getChapter(d.book, d.chapter)!.slice(a - 1, b)).split(' ');
    for (const w of [...(m.bold ?? []), ...(m.italic ?? []), ...(m.circle ? [m.circle] : [])]) {
      assert.ok(words.includes(w), `${d.id}: "${w}" no está en el texto`);
    }
    if (m.underline)
      assert.ok(findSequence(words, m.underline.split(' ')) >= 0, `${d.id}: "${m.underline}" no está`);
  }
});
