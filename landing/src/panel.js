// Panel de uso: lee un resumen agregado de la Edge Function `panel` (protegida con PANEL_TOKEN).
// Nunca muestra emails ni eventos sueltos: solo conteos.
import '@fontsource-variable/inter/wght.css';
import './panel.css';

const API = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/panel`;
const TOKEN_KEY = 'bereano.panel';

// Nombres legibles para pantallas y eventos.
const SCREENS = {
  '(tabs)': 'Hoy',
  '(tabs)/index': 'Hoy',
  '(tabs)/companero': 'Compañero',
  '(tabs)/biblia': 'Biblia',
  '[book]/[chapter]': 'Lector',
  'devocional/[id]': 'Devocional',
  planes: 'Planes',
  'planes/[id]': 'Detalle de plan',
  'planes/[id]/[dia]': 'Día de plan',
  bienvenida: 'Bienvenida',
  plus: 'Paywall (Plus)',
  compartir: 'Compartir versículo',
  buscar: 'Buscar',
  ajustes: 'Ajustes',
  oracion: 'Diario de oración',
  racha: 'Racha',
  resaltados: 'Mis resaltados',
  ayuda: 'Ayuda en crisis',
};
const EVENTS = {
  app_abierta: 'Abrió la app',
  onboarding_fin: 'Terminó la bienvenida',
  devocional_leido: 'Marcó el devocional como leído',
  devocional_guardado: 'Guardó un devocional',
  companero_pregunta: 'Preguntó al compañero',
  companero_limite: 'Llegó al límite del compañero',
  paywall_visto: 'Vio el paywall',
  compra_intento: 'Tocó suscribirse',
  compartir_imagen: 'Compartió una imagen',
  diseno_bloqueado: 'Tocó un diseño de Plus',
  compartir_versiculo_abierto: 'Abrió compartir versículo',
  plan_empezado: 'Empezó un plan',
  resaltado: 'Resaltó un versículo',
  nota_guardada: 'Guardó una nota',
  oracion_agregada: 'Agregó un pedido de oración',
  oracion_respondida: 'Marcó una oración respondida',
  recordatorio_activado: 'Activó el recordatorio',
  recordatorio_desactivado: 'Desactivó el recordatorio',
  tema_cambiado: 'Cambió el tema',
  email_registrado: 'Dejó su email (app)',
  page_view: 'Visitó la landing',
  waitlist_form_iniciado: 'Empezó el formulario',
  waitlist_form_enviar_click: 'Tocó enviar el formulario',
  waitlist_registro_ok: 'Se anotó en la lista',
  waitlist_registro_error: 'Error al anotarse',
  waitlist_form_error_validacion: 'Error de validación',
  demo_visto: 'Vio la demo del compañero',
  cta_hero: 'Botón principal (arriba)',
  cta_header: 'Botón del encabezado',
  cta_demo: 'Botón de la demo',
  cta_planes: 'Botón de planes',
  puerta_falsa_companero: 'Puerta falsa: compañero',
  puerta_falsa_planes_tema: 'Puerta falsa: planes por tema',
  puerta_falsa_modo_grupo: 'Puerta falsa: modo grupo',
  puerta_falsa_email_enviado: 'Dejó su email en una puerta falsa',
  compartir_click: 'Compartió la landing',
  faq_abierta: 'Abrió una pregunta frecuente',
  consentimiento_cookies: 'Respondió las cookies',
};
const SOURCES = {
  landing: 'Formulario principal',
  puerta_companero: 'Puerta falsa: compañero',
  puerta_planes_tema: 'Puerta falsa: planes por tema',
  puerta_modo_grupo: 'Puerta falsa: modo grupo',
  app_devocional_email: 'App: devocional por email',
};

const $ = (id) => document.getElementById(id);
const fmt = new Intl.NumberFormat('es');
let days = 30;

function el(tag, attrs = {}, ...children) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') n.className = v;
    else if (k === 'style') n.setAttribute('style', v);
    else n.setAttribute(k, v);
  }
  for (const c of children) n.append(c instanceof Node ? c : document.createTextNode(String(c)));
  return n;
}

function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function load() {
  const token = getToken();
  if (!token) return showLogin();
  $('status').textContent = 'Cargando…';
  let res;
  try {
    res = await fetch(`${API}?days=${days}`, { headers: { Authorization: `Bearer ${token}` } });
  } catch {
    $('status').textContent = 'No se pudo conectar. Revisá tu conexión y recargá.';
    return;
  }
  if (res.status === 401) {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
    return showLogin('Esa clave no es correcta.');
  }
  if (!res.ok) {
    $('status').textContent = 'El servidor no respondió bien. Probá de nuevo en un rato.';
    return;
  }
  render(await res.json());
}

function showLogin(error) {
  $('login').hidden = false;
  $('content').hidden = true;
  $('controls').hidden = true;
  $('login-error').hidden = !error;
  $('login-error').textContent = error ?? '';
}

function render(d) {
  $('login').hidden = true;
  $('content').hidden = false;
  $('controls').hidden = false;
  $('status').textContent = `Últimos ${d.days} días · actualizado ${new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}`;

  const t = d.totals;
  $('tiles').replaceChildren(
    tile('Visitantes de la landing', t.landing_visitors),
    tile('Personas en la app', t.app_visitors),
    tile('Emails nuevos', t.emails, `${fmt.format(t.emails_all_time)} en total`),
    tile('Acciones registradas', t.events),
  );

  renderDaily(d.daily, d.days);
  $('funnel-landing').replaceChildren(funnel(d.funnel_landing));
  $('funnel-app').replaceChildren(funnel(d.funnel_app));
  $('screens').replaceChildren(
    bars(d.screens.map((s) => ({ label: SCREENS[s.screen] ?? s.screen, value: s.views, note: `${fmt.format(s.visitors)} personas` }))),
  );
  $('emails-note').textContent = `${fmt.format(t.emails)} en el período.`;
  $('emails').replaceChildren(bars(d.emails_by_source.map((s) => ({ label: SOURCES[s.source] ?? s.source, value: s.count }))));
  renderEvents(d.events_top);
}

function tile(label, value, note) {
  return el('div', { class: 'tile' }, el('p', { class: 'tile__label' }, label), el('p', { class: 'tile__value' }, fmt.format(value ?? 0)), note ? el('p', { class: 'muted' }, note) : '');
}

/** Barras horizontales con valor; una sola serie (el título dice qué es). */
function bars(items) {
  if (!items.length) return el('p', { class: 'muted' }, 'Todavía no hay datos en este período.');
  const max = Math.max(...items.map((i) => i.value), 1);
  return el(
    'ul',
    { class: 'bars' },
    ...items.map((i) =>
      el(
        'li',
        { title: `${i.label}: ${fmt.format(i.value)}` },
        el('span', { class: 'bars__label' }, i.label),
        el('span', { class: 'bars__track' }, el('span', { class: 'bars__fill', style: `width:${Math.max(2, (i.value / max) * 100)}%` })),
        el('span', { class: 'bars__value' }, fmt.format(i.value), i.note ? el('small', {}, ` · ${i.note}`) : ''),
      ),
    ),
  );
}

function funnel(steps) {
  const first = steps[0]?.visitors || 0;
  return bars(
    steps.map((s, i) => ({
      label: EVENTS[s.step] ?? s.step,
      value: s.visitors,
      note: i === 0 || !first ? '' : `${Math.round((s.visitors / first) * 100)}%`,
    })),
  );
}

function renderEvents(rows) {
  const table = $('events');
  if (!rows.length) {
    table.replaceChildren(el('caption', { class: 'muted' }, 'Todavía no hay acciones en este período.'));
    return;
  }
  table.replaceChildren(
    el('thead', {}, el('tr', {}, el('th', {}, 'Acción'), el('th', {}, 'Dónde'), el('th', { class: 'num' }, 'Veces'), el('th', { class: 'num' }, 'Personas'))),
    el(
      'tbody',
      {},
      ...rows.map((r) =>
        el(
          'tr',
          {},
          el('td', {}, EVENTS[r.name] ?? r.name),
          el('td', {}, el('span', { class: `chip chip--${r.source}` }, r.source === 'app' ? 'App' : 'Landing')),
          el('td', { class: 'num' }, fmt.format(r.count)),
          el('td', { class: 'num' }, fmt.format(r.visitors)),
        ),
      ),
    ),
  );
}

/** Líneas por día (landing y app), con cruz y tooltip al pasar el mouse. */
function renderDaily(rows, nDays) {
  const box = $('daily');
  const byDay = new Map(rows.map((r) => [r.day, r]));
  const data = [];
  for (let i = nDays - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    const r = byDay.get(key);
    data.push({ key, landing: r?.landing ?? 0, app: r?.app ?? 0 });
  }
  const series = [
    { id: 'landing', name: 'Landing', cls: 's-landing' },
    { id: 'app', name: 'App', cls: 's-app' },
  ];
  $('legend').replaceChildren(...series.map((s) => el('span', { class: `legend__item ${s.cls}` }, el('i'), s.name)));

  const W = 720, H = 220, L = 36, R = 100, T = 12, B = 26;
  const max = Math.max(4, ...data.map((d) => Math.max(d.landing, d.app)));
  const nice = Math.ceil(max / 4) * 4;
  const x = (i) => L + (i * (W - L - R)) / Math.max(1, data.length - 1);
  const y = (v) => T + (H - T - B) * (1 - v / nice);
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Personas por día en la landing y en la app');
  const add = (tag, attrs) => {
    const n = document.createElementNS(ns, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    svg.append(n);
    return n;
  };
  for (let g = 0; g <= 4; g++) {
    const v = (nice / 4) * g;
    add('line', { x1: L, x2: W - R, y1: y(v), y2: y(v), class: 'grid' });
    add('text', { x: L - 6, y: y(v) + 4, class: 'axis', 'text-anchor': 'end' }).textContent = fmt.format(v);
  }
  const step = Math.ceil(data.length / 6);
  data.forEach((d, i) => {
    if (i % step === 0 || i === data.length - 1)
      add('text', { x: x(i), y: H - 6, class: 'axis', 'text-anchor': 'middle' }).textContent = d.key.slice(5).split('-').reverse().join('/');
  });
  for (const s of series) {
    add('path', { d: data.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d[s.id])}`).join(''), class: `line ${s.cls}` });
    const last = data[data.length - 1];
    add('circle', { cx: x(data.length - 1), cy: y(last[s.id]), r: 4, class: `dot ${s.cls}` });
    add('text', { x: x(data.length - 1) + 8, y: y(last[s.id]) + 4, class: 'label' }).textContent = `${s.name} ${fmt.format(last[s.id])}`;
  }
  const cross = add('line', { y1: T, y2: H - B, class: 'cross', visibility: 'hidden' });
  const tip = el('div', { class: 'tip', hidden: '' });
  svg.addEventListener('pointermove', (e) => {
    const r = svg.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.max(0, Math.min(data.length - 1, Math.round(((px - L) / (W - L - R)) * (data.length - 1))));
    const d = data[i];
    cross.setAttribute('x1', x(i));
    cross.setAttribute('x2', x(i));
    cross.setAttribute('visibility', 'visible');
    tip.hidden = false;
    tip.replaceChildren(
      el('strong', {}, new Date(d.key + 'T12:00').toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' })),
      ...series.map((s) => el('span', { class: `legend__item ${s.cls}` }, el('i'), `${s.name}: ${fmt.format(d[s.id])}`)),
    );
    const left = (x(i) / W) * r.width;
    tip.style.left = `${Math.min(r.width - 150, Math.max(0, left + 12))}px`;
  });
  svg.addEventListener('pointerleave', () => {
    cross.setAttribute('visibility', 'hidden');
    tip.hidden = true;
  });
  box.replaceChildren(svg, tip);
}

$('login').addEventListener('submit', (e) => {
  e.preventDefault();
  const v = $('token').value.trim();
  try {
    localStorage.setItem(TOKEN_KEY, v);
  } catch {}
  load();
});
$('logout').addEventListener('click', () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
  showLogin();
});
for (const b of document.querySelectorAll('[data-days]')) {
  b.addEventListener('click', () => {
    days = Number(b.dataset.days);
    for (const o of document.querySelectorAll('[data-days]')) o.setAttribute('aria-checked', String(o === b));
    load();
  });
}

load();
