import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Platform } from 'react-native';

import { cleanEvent, type EventProps } from '@/lib/analytics-core';
import { supabase } from '@/lib/supabase';

// Estadísticas de uso anónimas para el panel: qué pantallas y botones se usan. Un id aleatorio
// por dispositivo (no el usuario de Supabase), sin textos que escriba la persona. Se mandan en
// tandas para no gastar batería. En desarrollo solo se muestran en la consola.

const VISITOR_KEY = 'bereano.visitor.v1';
let visitor: string | null = null;
let queue: {
  source: 'app';
  name: string;
  screen: string | null;
  visitor: string | null;
  props: EventProps;
}[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

function uuid(): string {
  const h = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16));
  h[12] = '4';
  h[16] = ((parseInt(h[16], 16) & 3) | 8).toString(16);
  const s = h.join('');
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}

const ready = AsyncStorage.getItem(VISITOR_KEY)
  .then(async (v) => {
    visitor = v && /^[0-9a-f-]{36}$/.test(v) ? v : uuid();
    if (visitor !== v) await AsyncStorage.setItem(VISITOR_KEY, visitor);
  })
  .catch(() => {
    visitor = uuid();
  });

async function flush() {
  timer = null;
  await ready;
  const rows = queue.splice(0).map((r) => ({ ...r, visitor }));
  if (!rows.length) return;
  // Si falla (sin conexión, límite), se pierde: son estadísticas, no datos de la persona.
  await supabase
    .from('analytics_events')
    .insert(rows)
    .then(
      () => {},
      () => {},
    );
}

export function track(name: string, props: Record<string, unknown> = {}, screen: string | null = null) {
  const ev = cleanEvent(name, { ...props, platform: Platform.OS });
  if (!ev) return;
  if (__DEV__) {
    console.info('[analytics]', ev.name, screen ?? '', ev.props);
    return;
  }
  queue.push({
    source: 'app',
    name: ev.name,
    screen: screen?.slice(0, 80) ?? null,
    visitor,
    props: ev.props,
  });
  if (queue.length >= 20) void flush();
  else if (!timer) timer = setTimeout(flush, 5000);
}

// Al ir a segundo plano, se manda lo pendiente.
AppState.addEventListener('change', (s) => {
  if (s !== 'active') void flush();
});
