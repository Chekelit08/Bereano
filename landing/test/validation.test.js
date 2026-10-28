import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { test } from 'node:test';

import { DOORS } from '../src/config.js';
import { EMAIL_RE, isValidEmail, isValidName, normalizeEmail, normalizeName } from '../src/validation.js';

const migrationsDir = new URL('../../supabase/migrations/', import.meta.url);
const sql = readdirSync(migrationsDir)
  .map((f) => readFileSync(new URL(f, migrationsDir), 'utf8'))
  .join('\n');

test('normaliza el email', () => {
  assert.equal(normalizeEmail('  Ana@Mail.COM '), 'ana@mail.com');
  assert.equal(normalizeEmail(undefined), '');
});

test('acepta emails válidos', () => {
  for (const e of ['ana@mail.com', 'ana.maria+bereano@correo.com.ar', 'j_p@sub.dominio.es']) {
    assert.ok(isValidEmail(e), e);
  }
});

test('rechaza emails inválidos', () => {
  for (const e of ['', 'ana', 'ana@', '@mail.com', 'ana@mail', 'ana@mail.c', 'ana mail@x.com', 'Ana@Mail.com']) {
    assert.ok(!isValidEmail(e), e);
  }
  assert.ok(!isValidEmail(`${'a'.repeat(250)}@test.com`), 'más de 254 caracteres');
});

test('normaliza y valida el nombre', () => {
  assert.equal(normalizeName('  Ana   María '), 'Ana María');
  assert.ok(isValidName('Ana'));
  assert.ok(!isValidName(''));
  assert.ok(!isValidName('a'.repeat(81)));
});

test('la regex del email es la misma en el cliente y en la base', () => {
  assert.ok(sql.includes(`email ~ '${EMAIL_RE.source}'`), 'actualizar la regex en los dos lados');
});

test('cada puerta falsa tiene su source permitido en la base', () => {
  for (const id of Object.keys(DOORS)) {
    assert.ok(sql.includes(`'puerta_${id}'`), `falta 'puerta_${id}' en el CHECK de source`);
  }
});
