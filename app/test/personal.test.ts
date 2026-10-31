/// <reference types="node" />
// Resaltados, oración, recordatorio, tema, eventos de uso, racha y email.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { cleanEvent, screenName } from '../src/lib/analytics-core';
import { bestStreak } from '../src/lib/dias';
import { EMAIL_RE, isValidEmail, normalizeEmail } from '../src/lib/email';
import {
  parseHighlights,
  parsePrayers,
  parseReminder,
  parseTheme,
  parseVerseKey,
  timeLabel,
  verseKey,
} from '../src/lib/personal';

test('resaltados: se validan al leerlos', () => {
  assert.equal(verseKey('jhn', 3, 16), 'jhn.3.16');
  assert.deepEqual(parseVerseKey('jhn.3.16'), { book: 'jhn', chapter: 3, verse: 16 });
  assert.equal(parseVerseKey('../x.1.1'), null);
  const h = parseHighlights({
    'jhn.3.16': { c: 'amarillo', t: 1, n: 'Gracia' },
    'psa.23.1': { c: 'verde', t: 2, n: '   ' },
    'gen.1.1': { c: 'negro', t: 3 },
    'malo': { c: 'azul', t: 4 },
    'rom.8.28': { c: 'azul' },
  });
  assert.deepEqual(Object.keys(h).sort(), ['jhn.3.16', 'psa.23.1']);
  assert.equal(h['jhn.3.16'].n, 'Gracia');
  assert.equal(h['psa.23.1'].n, undefined);
  assert.equal(parseHighlights({ 'jhn.3.16': { c: 'rosa', t: 1, n: 'x'.repeat(5000) } })['jhn.3.16'].n!.length, 1000);
  assert.deepEqual(parseHighlights('x'), {});
});

test('oración: se validan al leerlas', () => {
  const p = parsePrayers([
    { id: 'a', text: 'Por mi familia', at: 1 },
    { id: 'b', text: 'Trabajo', at: 2, answered: 3 },
    { id: 'c', text: '   ', at: 1 },
    { id: 'd', text: 'x', at: 'ayer' },
    null,
  ]);
  assert.deepEqual(p.map((x) => x.id), ['a', 'b']);
  assert.equal(p[1].answered, 3);
  assert.deepEqual(parsePrayers({}), []);
});

test('recordatorio y tema', () => {
  assert.deepEqual(parseReminder({ hour: 7, minute: 0 }), { hour: 7, minute: 0 });
  assert.equal(parseReminder({ hour: 25, minute: 0 }), null);
  assert.equal(parseReminder({ hour: 7.5, minute: 0 }), null);
  assert.equal(parseReminder(null), null);
  assert.equal(timeLabel({ hour: 21, minute: 30 }), '21:30');
  assert.equal(timeLabel({ hour: 7, minute: 0 }), '7:00');
  assert.equal(parseTheme('dark'), 'dark');
  assert.equal(parseTheme('violeta'), 'system');
});

test('eventos de uso: nombres y datos como pide la base', () => {
  assert.equal(cleanEvent('Hola Mundo', {}), null);
  const e = cleanEvent('devocional_leido', {
    id: 'x'.repeat(100),
    n: 3,
    ok: true,
    malo: { a: 1 },
    'Mal Nombre': 1,
    inf: Infinity,
  })!;
  assert.deepEqual(Object.keys(e.props).sort(), ['id', 'n', 'ok']);
  assert.equal((e.props.id as string).length, 60);
  assert.equal(screenName(['planes', '[id]', '[dia]']), 'planes/[id]/[dia]');
  assert.equal(screenName([]), '(tabs)');
  // El patrón del nombre es el mismo que el CHECK de la base.
  const sql = readFileSync(new URL('../../supabase/migrations/20261031013345_analytics.sql', import.meta.url), 'utf8');
  assert.ok(sql.includes("name ~ '^[a-z0-9_]{2,48}$'"));
});

test('racha más larga', () => {
  const d = (k: string) => ({ [k]: { devo: 1 as const } });
  const days = { ...d('2026-10-01'), ...d('2026-10-02'), ...d('2026-10-03'), ...d('2026-10-10'), ...d('2026-10-11') };
  assert.equal(bestStreak(days), 3);
  assert.equal(bestStreak({}), 0);
  // Cambio de mes
  assert.equal(bestStreak({ ...d('2026-09-30'), ...d('2026-10-01') }), 2);
});

test('email: misma validación que la base', () => {
  assert.equal(normalizeEmail('  Ana@Mail.COM '), 'ana@mail.com');
  assert.ok(isValidEmail('Ana@Mail.com'));
  assert.ok(!isValidEmail('no-es-email'));
  assert.ok(!isValidEmail(`${'a'.repeat(250)}@x.com`));
  const sql = readFileSync(new URL('../../supabase/migrations/20261028133457_create_waitlist.sql', import.meta.url), 'utf8');
  assert.ok(sql.includes(EMAIL_RE.source), 'la regex de la app no coincide con la de la base');
  const analytics = readFileSync(new URL('../../supabase/migrations/20261031013345_analytics.sql', import.meta.url), 'utf8');
  assert.ok(analytics.includes("'app_devocional_email'"));
});
