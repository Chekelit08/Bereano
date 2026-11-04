// Genera los carruseles: node generar.mjs --desde 2026-11-05 --dias 14 [--formato historia]
// Usa el Playwright instalado globalmente (igual que landing/scripts/og-image.mjs).
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { parseArgs } from 'node:util';

import { calendario } from './lib.mjs';

const { values } = parseArgs({
  options: {
    desde: { type: 'string' },
    dias: { type: 'string', default: '7' },
    formato: { type: 'string', default: 'post' },
  },
});
const desde = values.desde ? new Date(`${values.desde}T12:00:00`) : new Date();
const dias = Math.min(Math.max(Number(values.dias) || 7, 1), 60);
const historia = values.formato === 'historia';
const W = 1080;
const H = historia ? 1920 : 1350;
const BOTTOM = historia ? 420 : 230; // zona de botones y texto del posteo

const here = (p) => new URL(p, import.meta.url);
const font = (p) =>
  `data:font/woff2;base64,${readFileSync(here(`../landing/node_modules/@fontsource-variable/${p}`)).toString('base64')}`;
const FONTS = `
@font-face { font-family: Inter; src: url(${font('inter/files/inter-latin-wght-normal.woff2')}); font-weight: 100 900; }
@font-face { font-family: Literata; src: url(${font('literata/files/literata-latin-opsz-normal.woff2')}); font-weight: 200 900; }
@font-face { font-family: Literata; font-style: italic; src: url(${font('literata/files/literata-latin-opsz-italic.woff2')}); font-weight: 200 900; }`;
const CSS = readFileSync(here('./plantillas/carrusel.css'), 'utf8');
const LOGO = readFileSync(here('../landing/public/favicon.svg'), 'utf8');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** «citas» de la reflexión en cursiva. */
const conCitas = (s) => esc(s).replace(/«([^»]+)»/g, '<em>«$1»</em>');
/** Letra más chica cuanto más largo el texto, para que siempre entre. */
const fs = (t, max, min) =>
  Math.round(Math.max(min, Math.min(max, max - (t.length - 120) * 0.12)) * (historia ? 1.15 : 1));

function body(s) {
  switch (s.tipo) {
    case 'portada':
    case 'pregunta':
      return `<p class="kicker">${esc(s.kicker)}</p><h1 class="titulo">${esc(s.titulo)}</h1><p class="nota">${esc(s.nota)}</p>`;
    case 'verso':
      return `<p class="verso" style="--fs:${fs(s.texto, 64, 44)}px">“${esc(s.texto)}”</p><p class="cita">${esc(s.cita)}</p>`;
    case 'parrafo':
      return `<p class="parrafo" style="--fs:${fs(s.texto, 54, 40)}px">${conCitas(s.texto)}</p>`;
    case 'cierre':
      return `<h1 class="titulo">${esc(s.titulo)}</h1><p class="nota">${esc(s.nota)}</p><p class="cta">Link en la bio</p>`;
    default:
      throw new Error(`Lámina desconocida: ${s.tipo}`);
  }
}

function html(c, s) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>${FONTS}
:root { --w: ${W}px; --h: ${H}px; --bottom: ${BOTTOM}px; --c1: ${c.colores[0]}; --c2: ${c.colores[1]}; }
${CSS}</style></head><body>
<div class="blob blob--a"></div><div class="blob blob--b"></div>
<div class="marca">${LOGO}<span>Bereano</span></div>
${s.numero ? `<p class="numero">${s.numero}</p>` : ''}
<main class="slide ${s.tipo}">${body(s)}</main>
<p class="pie">Reina-Valera 1909</p>
</body></html>`;
}

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
const raiz = here(`./salida/${historia ? 'historias/' : ''}`);

for (const dia of calendario(desde, dias)) {
  for (const [i, c] of dia.carruseles.entries()) {
    const dir = new URL(`${dia.fecha}/${i + 1}-${c.id}/`, raiz);
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    for (const [n, s] of c.slides.entries()) {
      await page.setContent(html(c, s));
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: new URL(`${String(n + 1).padStart(2, '0')}.png`, dir).pathname });
    }
    writeFileSync(new URL('texto.txt', dir), c.texto + '\n');
    console.log(`${dia.fecha}  ${c.id}  (${c.slides.length} láminas)`);
  }
}
await browser.close();
console.log(`Listo: ${raiz.pathname}`);
