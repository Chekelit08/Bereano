// Lógica de los carruseles, sin navegador: qué toca cada día y el texto de cada lámina.
// El texto bíblico sale SIEMPRE de la Biblia de la app (Reina-Valera 1909). Nada se copia a mano.
import { readFileSync } from 'node:fs';

import { DEVOCIONALES, devocionalDelDia, shareRange, shareText } from '../app/src/data/devocionales.ts';
import { TEMAS } from '../app/src/data/temas.ts';

const bible = (p) => new URL(`../app/src/data/bible/${p}`, import.meta.url);
const BOOKS = JSON.parse(readFileSync(bible('books.json'), 'utf8'));
const cache = new Map();

export const GANCHOS = JSON.parse(readFileSync(new URL('./ganchos.json', import.meta.url), 'utf8'));

/** Largo máximo del texto de una lámina, para que entre con letra grande. */
export const MAX_VERSO = 330;
export const MAX_PARRAFO = 420;

export function bookName(code) {
  const b = BOOKS.find((x) => x.code === code);
  if (!b) throw new Error(`Libro desconocido: ${code}`);
  return b.name;
}

/** Versículos tal cual están en la Biblia de la app. Falla si alguno no existe. */
export function verses(book, chapter, from, to = from) {
  if (!cache.has(book)) cache.set(book, JSON.parse(readFileSync(bible(`text/${book}.json`), 'utf8')));
  const ch = cache.get(book)[chapter - 1];
  const out = [];
  for (let v = from; v <= to; v++) {
    const t = ch?.[v - 1];
    if (!t) throw new Error(`No existe ${book} ${chapter}:${v}`);
    out.push(t);
  }
  return out;
}

export const reference = (book, chapter, from, to) =>
  `${bookName(book)} ${chapter}:${from}${to && to !== from ? `–${to}` : ''}`;

/** Días desde el 1/1/2026, igual que el devocional del día de la app. */
export function dayIndex(date) {
  return Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(2026, 0, 1)) / 86_400_000);
}

const mod = (a, n) => ((a % n) + n) % n;

/** Carrusel "Versículos para…": portada, 5 versículos y cierre. */
export function carruselTema(date) {
  const day = dayIndex(date);
  const tema = TEMAS[mod(day, TEMAS.length)];
  const ganchos = GANCHOS[tema.id] ?? [`5 versículos sobre ${tema.title.toLowerCase()}`];
  const gancho = ganchos[mod(Math.floor(day / TEMAS.length), ganchos.length)];
  const slides = [{ tipo: 'portada', kicker: tema.title, titulo: gancho, nota: 'Deslizá →' }];
  tema.refs.forEach((r, i) => {
    slides.push({
      tipo: 'verso',
      numero: `${i + 1}/${tema.refs.length}`,
      texto: shareText(verses(r.book, r.chapter, r.from, r.to)),
      cita: reference(r.book, r.chapter, r.from, r.to),
    });
  });
  slides.push({
    tipo: 'cierre',
    titulo: 'Guardalo para cuando lo necesites.',
    nota: 'Más versículos por tema en Bereano. Gratis, en tu teléfono y en la web.',
  });
  const citas = tema.refs.map((r) => reference(r.book, r.chapter, r.from, r.to)).join(' · ');
  return {
    id: `tema-${tema.id}`,
    colores: tema.colors,
    slides,
    texto: [
      gancho,
      '',
      `${tema.subtitle}. Guardalo y mandáselo a quien lo necesite hoy.`,
      '',
      citas + ' (Reina-Valera 1909)',
      '',
      'Leé la Biblia cada día y entendé lo que leés: link en la bio.',
      '',
      hashtags(['versiculos', tema.id]),
    ].join('\n'),
  };
}

/** Carrusel "Devocional en 1 minuto": el mismo devocional que ese día muestra la app. */
export function carruselDevocional(date) {
  const d = devocionalDelDia(date);
  const [from, to] = shareRange(d);
  const parrafos = d.reflection.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const slides = [
    { tipo: 'portada', kicker: 'Devocional en 1 minuto', titulo: d.title, nota: reference(d.book, d.chapter, d.from, d.to) },
    { tipo: 'verso', texto: shareText(verses(d.book, d.chapter, from, to)), cita: reference(d.book, d.chapter, from, to) },
    ...parrafos.map((p) => ({ tipo: 'parrafo', texto: p })),
    { tipo: 'pregunta', kicker: 'Para aplicar hoy', titulo: d.question, nota: 'Respondela en los comentarios.' },
    { tipo: 'cierre', titulo: 'Un devocional nuevo cada día.', nota: 'Probá Bereano gratis: link en la bio.' },
  ];
  return {
    id: `devocional-${d.id}`,
    colores: ['#0B1F4D', '#0071E3'],
    slides,
    texto: [
      `${d.title} · Devocional en 1 minuto`,
      '',
      d.question,
      'Te leo en los comentarios.',
      '',
      `${reference(d.book, d.chapter, d.from, d.to)} (Reina-Valera 1909)`,
      '',
      'Un devocional nuevo cada día en Bereano: link en la bio.',
      '',
      hashtags(['devocional']),
    ].join('\n'),
  };
}

function hashtags(extra) {
  const base = ['biblia', 'devocional', 'fe', 'dios', 'versiculodeldia', 'cristianos'];
  const tags = [...new Set([...extra.map((t) => t.normalize('NFD').replace(/[^a-z]/gi, '')), ...base])];
  return tags.slice(0, 8).map((t) => `#${t}`).join(' ');
}

/** Los dos carruseles de cada día, desde una fecha. */
export function calendario(desde, dias) {
  const out = [];
  for (let i = 0; i < dias; i++) {
    const date = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate() + i);
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    out.push({ fecha: iso, carruseles: [carruselTema(date), carruselDevocional(date)] });
  }
  return out;
}

export const TOTAL = { temas: TEMAS.length, devocionales: DEVOCIONALES.length };
