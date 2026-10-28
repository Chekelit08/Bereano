// Genera public/og.png a partir de scripts/og-image.html.
// Uso: node scripts/og-image.mjs   (requiere Playwright instalado globalmente o en el proyecto)
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const here = (p) => fileURLToPath(new URL(p, import.meta.url));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(`file://${here('./og-image.html')}`);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: here('../public/og.png') });
await browser.close();
console.log('public/og.png generado');
