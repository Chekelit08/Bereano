# Deploy de la landing en Cloudflare Pages

> Nada de esto está hecho todavía: hace falta crear cuentas y proyectos (gratis), y eso lo decide Ezequiel.

## Antes de publicar

1. **Supabase**: crear el proyecto (plan gratis) y aplicar la migración (ver "Comandos útiles" en `CLAUDE.md`).
2. **PostHog**: crear el proyecto (plan gratis) y copiar la *Project API key* (`phc_...`).
3. Revisar los pendientes de `docs/decisiones.md`. Sobre todo: **completar los datos entre corchetes de `landing/privacidad.html`**.
4. En PostHog > Project settings: activar *Discard client IP data*.

## Opción A (recomendada): conectar el repo de GitHub

Cada push a `main` se publica solo, y cada rama tiene su URL de vista previa.

1. Dashboard de Cloudflare > Workers & Pages > Create > Pages > *Connect to Git* > `bereano`.
2. Configuración del build:
   - Framework preset: *None* (o Vite)
   - Root directory: `landing`
   - Build command: `npm run build`
   - Build output directory: `dist`
3. Variables de entorno (Settings > Variables and secrets), en **Production** y **Preview**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY` (la *publishable*, nunca la `service_role`)
   - `VITE_POSTHOG_KEY`
   - `VITE_POSTHOG_HOST` = `https://us.i.posthog.com`
   - `VITE_SITE_URL` = la URL pública (por ejemplo `https://bereano-landing.pages.dev`, o el dominio cuando exista)
   - `NODE_VERSION` = `22`
4. Guardar y desplegar. Probar el formulario en la URL `*.pages.dev`.

Las variables `VITE_*` se insertan en el JS durante el build: si las cambiás, hay que volver a desplegar.

## Opción B: subir desde la terminal

```bash
cd landing && npm run build
```

```bash
npx wrangler login
```

```bash
npx wrangler pages deploy dist --project-name bereano-landing
```

Con esta opción las variables salen del `.env` local en el momento del build.

## Dominio

Cuando se compre `bereano.app`: Pages > proyecto > Custom domains. Si el dominio está en Cloudflare, el DNS se configura solo.

## Después de publicar

- Si cambiás PostHog a la región EU o sumás otro servicio, actualizá la CSP en `landing/public/_headers`.
- Revisá que lleguen los headers: `curl -I https://<tu-url>`.
