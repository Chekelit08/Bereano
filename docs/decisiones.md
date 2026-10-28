# Decisiones técnicas

## Semana 1: landing con lista de espera (2026-10-28)

- **Vite + JS vanilla, sin framework.** Es una sola página: React no aporta nada y suma peso. Vite resuelve lo que sí necesitamos: variables de entorno en el build, archivos con hash para la caché y un servidor de desarrollo.
- **Fetch directo a la API REST de Supabase en vez de `supabase-js`.** Es un único INSERT; ahorra unos 40 KB. Si la landing crece (login, etc.), se pasa a `supabase-js`.
- **Seguridad en la base, no en el cliente.** RLS con una única política de INSERT, más `revoke all` y `grant insert` de solo 4 columnas. Son dos capas: si alguien agrega por error una política de SELECT, sin el privilegio igual no puede leer, y al revés. La validación (formato del email, largo del nombre, país, source) son CHECK en la tabla.
- **Emails duplicados:** el email se guarda normalizado (minúsculas, sin espacios; lo exige un CHECK) y tiene UNIQUE. El cliente trata el duplicado (409) igual que un alta nueva, así la página no le revela a nadie qué emails ya están anotados.
- **Puertas falsas:** cada puerta tiene su propio evento de PostHog (`puerta_falsa_companero`, `puerta_falsa_planes_tema`, `puerta_falsa_modo_grupo`) y el email entra a `waitlist` con `source` = la puerta. Si el email ya estaba anotado, el interés igual queda registrado en PostHog.
- **PostHog con carga diferida, sin autocapture ni grabación de sesiones.** La página carga 3 KB de JS propio y PostHog (unos 110 KB) llega después. Sin autocapture ni replay, para no capturar datos personales del formulario. El email no se manda a PostHog.
- **Fuentes autoalojadas (Fraunces para títulos, Literata para el texto).** Literata fue diseñada para leer textos largos en pantalla. Al autoalojarlas no se le piden las fuentes a Google (un problema de privacidad bajo el RGPD en España) y funcionan con una CSP estricta.
- **Español neutro con "tú"** en la landing: el público principal son los hispanos en EE.UU. (mayoría mexicana y centroamericana) y España. Por eso el botón dice "Pregúntale a tu compañero". Si preferís voseo, se cambia fácil.
- **Precio anual mostrado: USD 39,99** (el techo del rango). Si después se lanza más barato, es una buena noticia; al revés sería una mala.

## Eventos de PostHog

| Evento | Cuándo |
| --- | --- |
| `$pageview` / `$pageleave` | Automáticos |
| `cta_hero` | Botón principal del hero |
| `waitlist_form_iniciado` | Primer foco en el formulario |
| `waitlist_form_enviar_click` | Clic en "Unirme a la lista" |
| `waitlist_form_error_validacion` | Dato inválido (`campo`) |
| `waitlist_registro_ok` / `waitlist_registro_error` | Respuesta de Supabase (`pais`) |
| `puerta_falsa_companero` / `_planes_tema` / `_modo_grupo` | Clic en cada puerta |
| `puerta_falsa_email_enviado` | Email dejado en el aviso (`puerta`) |
| `compartir_click` | Botón de compartir (`metodo`) |

## Pendientes antes de publicar

- [ ] Verificar el texto de Hechos 17:11 contra una fuente confiable de la RV1909.
- [ ] Política de privacidad, con link desde el formulario. En España hace falta informar el uso de los datos.
- [ ] Banner de consentimiento para visitantes de la UE (PostHog guarda un identificador en el navegador).
- [ ] Definir el alcance del 50% (¿el primer año?, ¿cuántos son "los primeros"?).
- [ ] Anti-spam más fuerte que el honeypot (Cloudflare Turnstile + Edge Function), si empiezan a llegar altas basura.
- [ ] Imagen para compartir (og:image) de 1200×630.
