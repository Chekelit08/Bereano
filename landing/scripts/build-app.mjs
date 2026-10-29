// Compila la versión web de la app y la deja en dist/app (se publica en /app del sitio).
// Cloudflare Builds la corre después de `vite build`. En la CI de la landing se saltea
// con SKIP_APP_BUILD=1 (la app tiene su propio job).
import { execSync } from 'node:child_process';
import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

if (process.env.SKIP_APP_BUILD === '1') {
  console.log('build-app: salteado (SKIP_APP_BUILD=1)');
  process.exit(0);
}

const app = resolve(import.meta.dirname, '../../app');
const out = resolve(import.meta.dirname, '../dist/app');
const run = (cmd, env = {}) =>
  execSync(cmd, { cwd: app, stdio: 'inherit', env: { ...process.env, ...env } });

run('npm ci --no-audit --no-fund');
run(`npx expo export --platform web --output-dir "${out}"`, { EXPO_WEB_BASE_URL: '/app' });
// La app resuelve sus rutas en el navegador: cualquier /app/... que no sea un archivo
// devuelve la app (Cloudflare sirve el 404.html más cercano).
copyFileSync(resolve(out, 'index.html'), resolve(out, '404.html'));
