/// <reference types="node" />
// Memorizar versículos: palabras tapadas y repaso espaciado.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { INTERVALS, isDue, maskedWords, parseMemory, review, type MemoryItem } from '../src/lib/memoria';

const TEXT = 'Porque de tal manera amó Dios al mundo, que ha dado á su Hijo unigénito';

test('se tapan más palabras en cada nivel, siempre las mismas', () => {
  const counts = [0, 1, 2, 3].map((l) => maskedWords(TEXT, l, 7).filter(Boolean).length);
  for (let i = 1; i < counts.length; i++) assert.ok(counts[i] >= counts[i - 1]);
  assert.equal(counts[3], TEXT.split(' ').length);
  assert.deepEqual(maskedWords(TEXT, 1, 7), maskedWords(TEXT, 1, 7));
  assert.ok(counts[0] >= 1);
});

test('repaso espaciado', () => {
  const today = new Date(2026, 10, 3);
  let item = { added: 0, streak: 0, due: '2026-11-03' };
  assert.ok(isDue(item, today));
  item = review(item, true, today);
  assert.equal(item.due, '2026-11-04');
  item = review(item, true, today);
  assert.equal(item.due, '2026-11-06');
  item = review(item, false, today);
  assert.equal(item.streak, 0);
  assert.equal(item.due, '2026-11-04');
  let s: MemoryItem = { added: 0, streak: INTERVALS.length, due: '2026-11-03' };
  s = review(s, true, today);
  assert.equal(s.streak, INTERVALS.length);
});

test('lo guardado se valida', () => {
  const m = parseMemory({
    'jhn.3.16': { added: 1, streak: 2, due: '2026-11-05' },
    malo: { added: 1, streak: 0, due: '2026-11-05' },
    'psa.23.1': { added: 1, streak: 1.5, due: '2026-11-05' },
    'rom.8.28': { added: 1, streak: 99, due: '2026-11-05' },
  });
  assert.deepEqual(Object.keys(m).sort(), ['jhn.3.16', 'rom.8.28']);
  assert.equal(m['rom.8.28'].streak, INTERVALS.length);
});
