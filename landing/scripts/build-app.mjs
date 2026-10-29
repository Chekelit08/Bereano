// Compila la versión web de la app y la deja en dist/app (se publica en /app del sitio).
// Cloudflare Builds la corre después de `vite build`. En la CI de la landing se saltea
// con SKIP_APP_BUILD=1 (la app tiene su propio job).
import { execSync } from 'node:child_process';
import { copyFileSync, readFileSync, readdirSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

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

// Cloudflare entra en un bucle de redirecciones con las rutas que tienen "@" (%40), como
// assets/node_modules/@expo-google-fonts: las tipografías no cargaban. Se renombran esas
// carpetas a "_at_..." y se actualizan las referencias en el código exportado.
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? [p, ...walk(p)] : [p];
  });
const modules = resolve(out, 'assets/node_modules');
for (const name of readdirSync(modules))
  if (name.startsWith('@')) renameSync(join(modules, name), join(modules, `_at_${name.slice(1)}`));
for (const file of walk(out).filter((p) => /\.(js|html)$/.test(p))) {
  const text = readFileSync(file, 'utf8');
  const fixed = text.replaceAll('/assets/node_modules/@', '/assets/node_modules/_at_');
  if (fixed !== text) writeFileSync(file, fixed);
  if (fixed.includes('/assets/node_modules/@')) throw new Error(`Quedó una ruta con @ en ${file}`);
}
