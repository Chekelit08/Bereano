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

## Mejoras (2026-10-28, segunda tanda)

- **Anti-spam en la base: 30 altas por IP por hora.** Un trigger cuenta las altas por IP usando el header que manda Supabase. Es alto a propósito, porque un grupo de una iglesia se anota desde el mismo WiFi. Guarda solo el hash de la IP y lo borra a las 24 horas.
- **Consentimiento solo en Europa.** Se detecta por la zona horaria del navegador, sin pedir ubicación. Sin consentimiento PostHog cuenta la visita en memoria, sin cookies; si se acepta, pasa a recordarla. Fuera de Europa no se muestra el banner, para no frenar la conversión donde no es obligatorio.
- **Tests que se verifican solos.** El test SQL falla con error si algo no da lo esperado, y corre en la CI contra Postgres 17 con los roles de Supabase simulados. Un test de JS compara la regex del email y los `source` con la migración, así cliente y base no se desincronizan.
- **Imagen para compartir generada desde HTML** (`landing/scripts/og-image.html`): se retoca como una página y se regenera con `node scripts/og-image.mjs`.
- **Verificado:** el texto de Hechos 17:11 coincide con la RV1909.

## Rediseño editorial (2026-10-28, tercera tanda)

Referencias de Ezequiel: Pear, Dead North, Apocalypse Coffee, Illoca, Santioni, entre otras. Se tomó su lenguaje: tipografía gigante, etiquetas monoespaciadas, líneas de grilla con `+`, grano de papel, secciones numeradas, una cinta en movimiento y un bloque invertido.

- **Grabados de Gustave Doré (1866), de dominio público**, sacados de *The Doré Bible Gallery* en Project Gutenberg (ebook 8710). Son el equivalente bíblico a las estatuas clásicas de Pear. El del hero es *El camino a Emaús*: Jesús camina con dos discípulos y les explica las Escrituras, que es justamente lo que hace el compañero.
- **Los grabados se funden con el papel** con `mix-blend-mode: multiply` y, en modo oscuro, se invierten con `screen`. Una sola imagen sirve para los dos temas.
- **Sin pantalla de carga.** Muchas de las referencias tienen una, pero cuesta visitas: con tráfico frío de TikTok, cada segundo cuenta. En su lugar el título entra línea por línea, solo con CSS.
- **Las animaciones no rompen nada.** El hero se anima con CSS, sin depender de JS. Las secciones de abajo se ocultan solo cuando el script de movimiento ya cargó, y todo queda quieto si el usuario pidió reducir el movimiento.
- **IBM Plex Mono** para las etiquetas, autoalojada como las otras dos fuentes (solo el subconjunto latino, 2 pesos).
- **Imagen que sigue al cursor** sobre las puertas falsas: solo con mouse y en pantallas grandes. En el celular son filas grandes y fáciles de tocar.

## Deploy en Cloudflare Workers en vez de Pages (2026-10-28)

- El panel de Cloudflare ofrece primero Workers y el proyecto quedó creado así. En vez de borrarlo y rehacerlo como Pages, nos quedamos con Workers con static assets: es lo que Cloudflare recomienda hoy para sitios estáticos, es gratis con uso comercial y respeta el mismo `_headers` de seguridad. Solo cambia `landing/wrangler.toml`.
- El comando de deploy fija `wrangler@4` para que una versión mayor nueva no rompa el deploy sin aviso.

## Landing más moderna (2026-10-28, cuarta tanda)

- **Demo del compañero en un celular.** Las landings actuales muestran el producto funcionando. Primero aparece "escribiendo…", después la respuesta palabra por palabra y al final las citas verificadas. Usa solo versículos comprobados en la RV1909 (Mateo 5:5, Salmos 37:11, Mateo 11:29) y está rotulada como "vista previa de la app". Las palabras están en el HTML desde el principio, así que los lectores de pantalla leen la respuesta completa.
- **El versículo se ilumina con el scroll**, y el resaltado pasa como un marcador cuando la frase clave ya se encendió.
- **"Cómo funciona" con tarjetas que se apilan**, hechas con `position: sticky`, sin JS.
- **Preguntas frecuentes** con `<details>` nativo: funciona con teclado y sin JS, y registra en PostHog qué pregunta se abre. Los precios salen de `config.js`, igual que en la tarjeta de precio.
- **Encabezado que se esconde al bajar** y vuelve al subir. **Botones magnéticos** solo con mouse.
- Con "reducir movimiento" todo se ve completo y quieto.

## Más movimiento (2026-10-28, quinta tanda)

- **Intro con contador** ("Bereano" + 000→100 y la cortina sube). Dura ~1,3 s, sale solo la primera vez por visita y nunca con "reducir movimiento". La decide `public/theme.js` antes de pintar; si el JS no llega, el CSS la cierra solo a los 2,6 s.
- **Scroll suave con Lenis** solo con mouse o trackpad (en el celular el nativo es mejor). Se frena cuando está abierto el aviso de "próximamente".
- **Galería horizontal de planes por tema** (Ansiedad, Perdón, Familia, Fe en la tormenta, Duelo y esperanza). En escritorio queda fija y avanza de costado con el scroll; en el celular es un carrusel nativo con scroll-snap. Cada tarjeta abre la puerta falsa de planes, con `origen: galeria` en el evento para distinguirla de la fila. Solo cita capítulos (sin versículos textuales).
- **Cursor propio** que crece y muestra etiquetas ("Ver plan", "Abrir"); el cursor del sistema sigue visible.
- **La cinta reacciona al scroll** (acelera y cambia de sentido) y hay una **barra de progreso** arriba.

## Sin imágenes: landing 100% tipográfica (2026-10-28)

A Ezequiel no le gustaron los grabados de Doré, así que se sacaron todos (hero, puertas falsas y galería) y se borraron del repo. Todo el impacto visual sale ahora de la tipografía y de formas hechas en código:

- **Hero**: el título ocupa todo el ancho. En lugar del grabado hay un **sello circular** que gira con "Escudriñando cada día las Escrituras · Hechos 17:11" y un **halo de color cálido** que respira detrás (CSS, sin imagen).
- **Planes por tema**: tarjetas de **colores sólidos** (bermellón, ocre, oliva, azul tinta, papel) con un número gigante en contorno que se rellena al pasar el mouse. Iguales en modo claro y oscuro.
- **Puertas falsas**: sin imagen que sigue al cursor; queda el cursor con la etiqueta "Abrir".
- **Imagen para compartir**: rehecha solo con tipografía.
- Beneficio extra: la página pesa ~1 MB menos y carga más rápido.

## Eventos de PostHog

| Evento | Cuándo |
| --- | --- |
| `$pageview` / `$pageleave` | Automáticos |
| `cta_hero` / `cta_header` / `cta_demo` | Botón del hero / "Unirme" del encabezado / botón de la demo |
| `demo_visto` | La demo del compañero empezó a escribir (llegó a verse) |
| `faq_abierta` | Se abrió una pregunta frecuente (`pregunta`) |
| `waitlist_form_iniciado` | Primer foco en el formulario |
| `waitlist_form_enviar_click` | Clic en "Unirme a la lista" |
| `waitlist_form_error_validacion` | Dato inválido (`campo`) |
| `waitlist_registro_ok` / `waitlist_registro_error` | Respuesta de Supabase (`pais` / `motivo`) |
| `puerta_falsa_companero` / `_planes_tema` / `_modo_grupo` | Clic en cada puerta (`origen`: `fila` o `galeria`) |
| `cta_planes` | Botón "Avisarme" al final de la galería de planes |
| `puerta_falsa_email_enviado` | Email dejado en el aviso (`puerta`) |
| `compartir_click` | Botón de compartir (`metodo`) |
| `consentimiento_cookies` | Respuesta al banner (`eleccion`), solo Europa |

## Pendientes antes de publicar

- [x] Verificar el texto de Hechos 17:11 contra la RV1909.
- [x] Banner de consentimiento para visitantes de la UE.
- [x] Imagen para compartir (og:image) de 1200×630.
- [x] Límite anti-spam básico (30 altas por IP por hora).
- [x] Crear el proyecto de Supabase y aplicar las migraciones (bereano, us-east-1). Verificado contra la API real: leer, editar y borrar dan 401; los datos inválidos los rechazan los CHECK.
- [ ] **Completar la política de privacidad** (`landing/privacidad.html`): nombre del responsable, email de contacto y fecha. Que la revise alguien que sepa de RGPD.
- [ ] Definir el alcance del 50% (¿el primer año?, ¿cuántos son "los primeros"?).
- [ ] En PostHog: activar "Discard client IP data" en la configuración del proyecto.
- [ ] Si igual llega spam: Cloudflare Turnstile (requiere cuenta).

## Compañero de estudio con IA (MVP)

- **Dónde corre:** Edge Function `supabase/functions/companero`. La clave de Anthropic y la service_role viven solo ahí (variables de entorno). La app solo tiene la clave pública.
- **Modelo:** Claude Haiku 5.5 (`claude-haiku-5-5`), el más barato: USD 0,10 por millón de tokens de entrada y 0,50 de salida. El prompt de sistema queda en caché (más barato todavía) y las primeras preguntas repetidas se responden desde `companion_cache` sin llamar a la IA.
- **Nunca inventar versículos:** la IA devuelve JSON con la respuesta y la lista de citas. Cada cita se busca en `bible_verses`; el texto que ve el usuario sale de la base, no de la IA. Si la respuesta menciona un pasaje que no está verificado o copia entre comillas algo que no coincide, se le pide que corrija una vez; si sigue mal, no se muestra.
- **Crisis:** si la pregunta tiene señales de autolesión, suicidio o violencia, no se llama a la IA: la app abre la pantalla de ayuda con líneas por país (`app/src/data/ayuda.ts`, **verificar los números antes de publicar**). La IA también puede marcar crisis.
- **Límite:** `COMPANION_DAILY_LIMIT` preguntas por usuario y por día (20 por defecto), contado en `companion_usage` con una función atómica. Si falla por un error nuestro, se devuelve el uso.
- **Sesión:** login anónimo de Supabase (sin pedir email). Las tablas del compañero no tienen políticas para `authenticated`: solo las toca la Edge Function.
- **Privacidad:** las conversaciones quedan solo en el teléfono. El servidor no guarda preguntas (la caché guarda un hash de la pregunta y la respuesta, sin usuario) y no las escribe en los logs.

## Paywall (Bereano Plus)

- **RevenueCat** maneja las suscripciones de App Store y Google Play. En Expo Go corre en modo simulado; para cobrar hace falta un build de desarrollo. Sin claves, la app muestra el paywall en modo demostración.
- **Gratis siempre:** Biblia, buscador, devocional, versículo del día y el plan de Juan. **Plus:** compañero (30 preguntas por día) y planes por tema. Sin Plus, el compañero da 3 preguntas de regalo en total y los planes por tema dejan leer el día 1.
- **El servidor decide:** RevenueCat avisa por webhook y guardamos la suscripción en `subscriptions` (el id de RevenueCat es el mismo que el de Supabase). El compañero consulta `is_plus` antes de contar la pregunta. Así nadie se da Plus tocando la app.
- La pantalla de Plus muestra precio, período, prueba gratis, renovación automática y cómo cancelar, como piden Apple y Google.

## Diseños para historias y onboarding

- **12 estilos × 3 tonos** (`app/src/components/cards`). Cada día `designsForDay` propone 3 distintos: cada 4 días pasan los 12 estilos, mezclados distinto en cada vuelta. El primero es gratis; los otros dos, de Plus.
- **Compartir cualquier versículo (Plus):** en el lector se tocan hasta 5 versículos seguidos y se abre `/compartir`. Gratis: el diseño Minimal. Plus: los 36. El texto siempre sale de la Biblia de la app (se valida el pasaje de la URL).
- **Onboarding** (`/bienvenida`): objetivo, nombre opcional (queda solo en el teléfono) y un "primer momento" con el versículo de hoy, una pregunta sugerida para el compañero y un plan recomendado según el objetivo.
- Tipografías nuevas en las tarjetas: DM Serif Display y Bebas Neue (licencia OFL, gratis para uso comercial).
