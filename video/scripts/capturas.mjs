// Capturas reales de la app (producción) para el video. Se corre a mano:
//   node scripts/capturas.mjs [https://bereano.ezeadenett.workers.dev]
// Deja PNG de página entera en public/app/ (390 px de ancho ×2), para hacer scroll dentro del teléfono.
import { createRequire } from 'node:module';

const { chromium } = createRequire(import.meta.url)('playwright');
const BASE = (process.argv[2] ?? 'https://bereano.ezeadenett.workers.dev') + '/app';
const OUT = new URL('../public/app/', import.meta.url).pathname;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: 'light' });
const p = await ctx.newPage();
await p.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await p.getByText('Empezar', { exact: true }).click();
await p.getByText('Encontrar paz').click();
await p.getByText('Seguir', { exact: true }).click();
await p.getByPlaceholder('Tu nombre').fill('Lucía');
await p.getByText('Seguir', { exact: true }).click();
await p.waitForTimeout(1500);

const shot = async (name, url, prep, full = true) => {
  await p.goto(`${BASE}${url}`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  if (prep) await prep();
  // La app scrollea dentro de un contenedor: se agranda la ventana para capturar todo.
  const h = full ? await p.evaluate(() => Math.max(...[...document.querySelectorAll('*')].map((e) => e.scrollHeight))) : 844;
  await p.setViewportSize({ width: 390, height: Math.min(Math.max(h, 844), 3200) });
  await p.waitForTimeout(800);
  await p.screenshot({ path: `${OUT}/${name}.png` });
  await p.setViewportSize({ width: 390, height: 844 });
};
await shot('hoy', '/');
await shot('devocional', '/devocional/pastor');
await shot('planes', '/planes');
await shot('oracion-guiada', '/oracion-guiada');
await shot('lector', '/jhn/3', async () => {
  await p.getByText(/Porque de tal manera/).first().click();
  await p.getByLabel('Resaltar en amarillo').click();
  await p.waitForTimeout(400);
  await p.keyboard.press('Escape');
}, false);
await shot('racha', '/racha', null, false);
await browser.close();
console.log('listo');
