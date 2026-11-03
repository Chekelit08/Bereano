// Capturas de la app web para la landing (se corre a mano, no en el build):
//   1. compilar la landing con la app y servirla (npx wrangler dev --port 8790)
//   2. node scripts/capturas.mjs [http://127.0.0.1:8790]
// Deja PNG en public/img/. Después se pasan a WebP (ver docs/deploy-cloudflare.md).
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

// Playwright está instalado de forma global (no es dependencia de la landing).
const { chromium } = createRequire(import.meta.url)('playwright');

const BASE = (process.argv[2] ?? 'http://127.0.0.1:8790') + '/app';
const OUT = resolve(import.meta.dirname, '../public/img');

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: 'light' });
const p = await ctx.newPage();
await p.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await p.getByText('Empezar', { exact: true }).click();
await p.getByText('Encontrar paz').click();
await p.getByText('Seguir', { exact: true }).click();
await p.getByPlaceholder('Tu nombre').fill('Lucía');
await p.getByText('Seguir', { exact: true }).click();
await p.getByText(/Leer el devocional/).click();
await p.waitForTimeout(800);
await p.getByText('Marcar como leído').click();

const shot = async (name, url, prep) => {
  await p.goto(`${BASE}${url}`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1200);
  if (prep) await prep();
  await p.screenshot({ path: `${OUT}/${name}.png` });
};
await shot('app-hoy', '/');
await shot('app-temas', '/temas');
await shot('app-planes', '/planes');
await shot('app-lector', '/jhn/3', async () => {
  await p.getByText(/Porque de tal manera/).first().click();
  await p.getByLabel('Resaltar en amarillo').click();
  await p.waitForTimeout(400);
});
await shot('app-historias', '/', async () => {
  await p.getByText('Para tus historias').scrollIntoViewIfNeeded();
  await p.mouse.wheel(0, 260);
  await p.waitForTimeout(500);
});
await shot('app-oracion', '/oracion', async () => {
  for (const t of ['Por la salud de mi mamá', 'Sabiduría para el trabajo nuevo', 'Por mi hermano']) {
    await p.getByLabel('Nuevo pedido de oración').fill(t);
    await p.getByText('Agregar', { exact: true }).click();
  }
});
await browser.close();
console.log('listo');
