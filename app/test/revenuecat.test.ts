/// <reference types="node" />
// Webhook de RevenueCat: qué eventos cambian la suscripción.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseEvent, safeEqual } from '../../supabase/functions/revenuecat-webhook/core';

const U = '7f3c1c8e-2b4a-4c1e-9d8a-1a2b3c4d5e6f';
const ev = (e: Record<string, unknown>) => ({
  event: { type: 'INITIAL_PURCHASE', app_user_id: U, entitlement_ids: ['plus'], event_timestamp_ms: 1000, ...e },
});

test('compra inicial con prueba gratis', () => {
  const r = parseEvent(ev({ expiration_at_ms: 1_800_000_000_000, period_type: 'TRIAL', store: 'APP_STORE' }));
  assert.deepEqual(r, {
    userId: U,
    expiresAt: new Date(1_800_000_000_000).toISOString(),
    periodType: 'trial',
    store: 'APP_STORE',
    eventTs: 1000,
  });
});

test('vencimiento deja la suscripción vencida', () => {
  const r = parseEvent(ev({ type: 'EXPIRATION', entitlement_ids: [], expiration_at_ms: 500 }));
  assert.ok(!('skip' in r) && r.expiresAt === new Date(500).toISOString());
});

test('usa el alias de Supabase si el id principal es anónimo de RevenueCat', () => {
  const r = parseEvent(ev({ app_user_id: '$RCAnonymousID:abc', aliases: ['$RCAnonymousID:abc', U] }));
  assert.ok(!('skip' in r) && r.userId === U);
});

test('ignora lo que no corresponde', () => {
  assert.ok('skip' in parseEvent(null));
  assert.ok('skip' in parseEvent({ event: { type: 'TEST' } }));
  assert.ok('skip' in parseEvent(ev({ entitlement_ids: ['otro'] })));
  assert.ok('skip' in parseEvent(ev({ app_user_id: 'no-es-uuid', aliases: [] })));
  assert.ok('skip' in parseEvent(ev({ event_timestamp_ms: 'x' })));
  assert.ok('skip' in parseEvent(ev({ expiration_at_ms: 'mañana' })));
});

test('comparación del secreto', () => {
  assert.ok(safeEqual('Bearer abc', 'Bearer abc'));
  assert.ok(!safeEqual('Bearer abc', 'Bearer abd'));
  assert.ok(!safeEqual('Bearer ab', 'Bearer abc'));
});
