# Deploy de la landing en Cloudflare (Workers)

> Estado: Supabase listo (proyecto `bereano`, ref `annxvazsnzlkeqkrqwfk`, us-east-1). Worker de Cloudflare `bereano` creado y conectado al repo. Falta PostHog.

## Antes de publicar

1. ~~**Supabase**: crear el proyecto y aplicar las migraciones.~~ Hecho. URL: `https://annxvazsnzlkeqkrqwfk.supabase.co`; la clave publishable está en el panel (Project Settings > API Keys).
2. **PostHog**: crear el proyecto (plan gratis) y copiar la *Project API key* (`phc_...`).
3. Revisar los pendientes de `docs/decisiones.md`. Sobre todo: **completar los datos entre corchetes de `landing/privacidad.html`**.
4. En PostHog > Project settings: activar *Discard client IP data*.

## Cómo está publicado: Cloudflare Workers con static assets

Cloudflare hoy ofrece primero Workers para sitios estáticos (gratis y con uso comercial permitido, igual que Pages), y lee igual el `_headers` de seguridad. El Worker se llama `bereano` y está conectado al repo: cada push a `main` se publica solo, y cada rama tiene su vista previa.

Configuración (Worker `bereano` > Settings > Build):

| Campo | Valor |
| --- | --- |
| Git repository | `Chekelit08/Bereano`, rama `main` |
| Root directory | `landing` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler@4 deploy` |
| Non-production branch deploy command | `npx wrangler@4 preview` (vistas previas por rama; necesita el bloque `[previews]` de `wrangler.toml`) |

Variables de build (Settings > Build > **Build variables and secrets**, no las de runtime):

- `VITE_SUPABASE_URL` = `https://annxvazsnzlkeqkrqwfk.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = la clave publishable (`sb_publishable_...`), nunca la `service_role`
- `VITE_POSTHOG_KEY` = la clave del proyecto de PostHog (`phc_...`), cuando exista
- `VITE_POSTHOG_HOST` = `https://us.i.posthog.com`
- `VITE_SITE_URL` = opcional; por defecto `https://bereano.ezeadenett.workers.dev`. Cargarla solo cuando haya dominio propio
- `NODE_VERSION` = `22`

Las variables `VITE_*` se insertan en el JS durante el build: si las cambiás, hay que volver a desplegar (Deployments > Retry build).

La config del Worker está en `landing/wrangler.toml` (`[assets] directory = "./dist"`).

## Subir a mano desde la terminal

```bash
cd landing && npm run build
```

```bash
npx wrangler@4 login
```

```bash
npx wrangler@4 deploy
```

## Dominio

Cuando se compre `bereano.app`: Worker `bereano` > Settings > Domains & Routes > Add > Custom domain. Si el dominio está en Cloudflare, el DNS se configura solo.

## Después de publicar

- Si cambiás PostHog a la región EU o sumás otro servicio, actualizá la CSP en `landing/public/_headers`.
- Revisá que lleguen los headers: `curl -I https://<tu-url>`.

## La app en la web (`/app`)

`npm run build` de la landing también compila la versión web de la app (`landing/scripts/build-app.mjs`) y la deja en `dist/app`, así que queda publicada en `/app` del mismo sitio. Es la misma app que la del teléfono: lo que guarda queda en el navegador y las compras están en modo demostración. Cualquier ruta `/app/...` devuelve la app (`dist/app/404.html`).

- Para compilar solo la landing: `npm run build:landing` o `SKIP_APP_BUILD=1 npm run build` (lo usa la CI).
- La app no está enlazada desde la landing. Para sacarla de la web, quitar `&& node scripts/build-app.mjs` del script `build`.
