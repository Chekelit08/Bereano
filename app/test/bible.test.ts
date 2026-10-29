/// <reference types="node" />
// Tests de la lectura sin conexión: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { books, getChapter, parseReference, searchText, SECTIONS } from '../src/lib/bible';

const ref = (s: string) => {
  const r = parseReference(s);
  return r && `${r.book.code} ${r.chapter}${r.verse ? `:${r.verse}` : ''}`;
};

test('citas escritas de muchas formas', () => {
  assert.equal(ref('Juan 3:16'), 'jhn 3:16');
  assert.equal(ref('juan 3 16'), 'jhn 3:16');
  assert.equal(ref('Jn 3.16'), 'jhn 3:16');
  assert.equal(ref('JUAN 3,16'), 'jhn 3:16');
  assert.equal(ref('1 juan 4 8'), '1jn 4:8');
  assert.equal(ref('1jn 4:8'), '1jn 4:8');
  assert.equal(ref('primera de juan 4:8'), undefined); // "de" no se interpreta
  assert.equal(ref('primera juan 4:8'), '1jn 4:8');
  assert.equal(ref('I Corintios 13'), '1co 13');
  assert.equal(ref('1 cor 13 4'), '1co 13:4');
  assert.equal(ref('Salmo 23'), 'psa 23');
  assert.equal(ref('sal 23 1'), 'psa 23:1');
  assert.equal(ref('Isaías 53 5'), 'isa 53:5');
  assert.equal(ref('isaias 53'), 'isa 53');
  assert.equal(ref('Romanos 8:28-30'), 'rom 8:28');
  assert.equal(ref('Gn 1 1'), 'gen 1:1');
  assert.equal(ref('apocalipsis 22:21'), 'rev 22:21');
  assert.equal(ref('Filipenses 4 13'), 'php 4:13');
});

test('citas que no existen no se aceptan', () => {
  assert.equal(ref('Juan 22'), undefined);
  assert.equal(ref('Juan 3:99'), undefined);
  assert.equal(ref('Hola 3'), undefined);
  assert.equal(ref('amor'), undefined);
  assert.equal(ref('juan 316'), undefined);
});

test('texto de la RV1909', () => {
  assert.equal(getChapter('gen', 1)?.[0], 'En el principio crió Dios los cielos y la tierra.');
  assert.equal(books.length, 66);
  const total = SECTIONS.reduce((n, s) => n + s.to - s.from + 1, 0);
  assert.equal(total, 66);
});

test('búsqueda sin acentos, frase exacta primero', () => {
  const hits = searchText('buen pastor');
  assert.ok(hits.length >= 2);
  assert.equal(`${hits[0].book.code} ${hits[0].chapter}:${hits[0].verse}`, 'jhn 10:11');
  assert.ok(searchText('jehova es mi pastor').some((h) => h.book.code === 'psa' && h.chapter === 23));
});

test('racha de días', async () => {
  const { streak, dayKey, parseDays } = await import('../src/lib/dias');
  const hoy = new Date(2026, 9, 28, 10);
  const d = (n: number) => dayKey(new Date(2026, 9, 28 - n));
  assert.equal(streak({}, hoy), 0);
  assert.equal(streak({ [d(0)]: { devo: 1 } }, hoy), 1);
  assert.equal(
    streak({ [d(1)]: { read: 1 }, [d(2)]: { chat: 1 } }, hoy),
    2,
    'hoy todavía no cuenta en contra',
  );
  assert.equal(streak({ [d(0)]: { devo: 1 }, [d(1)]: { read: 1 }, [d(3)]: { chat: 1 } }, hoy), 2);
  assert.equal(streak({ [d(0)]: {} }, hoy), 0);
  assert.deepEqual(parseDays({ '2026-10-28': { devo: 1, hack: 1 }, malo: { devo: 1 } }), {
    '2026-10-28': { devo: 1 },
  });
});
