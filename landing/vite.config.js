import { resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // URL pública del sitio, para las etiquetas de redes sociales (necesitan URL absoluta).
  // Cuando tengamos dominio, se define VITE_SITE_URL=https://bereano.app en Cloudflare.
  const env = loadEnv(mode, import.meta.dirname);
  process.env.VITE_SITE_URL = (env.VITE_SITE_URL || 'https://bereano-landing.pages.dev').replace(/\/$/, '');

  return {
    // Sitio de varias páginas: cada HTML es una entrada del build.
    build: {
      rollupOptions: {
        input: {
          main: resolve(import.meta.dirname, 'index.html'),
          privacidad: resolve(import.meta.dirname, 'privacidad.html'),
        },
      },
    },
  };
});
