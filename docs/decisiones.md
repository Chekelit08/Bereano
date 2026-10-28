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

## Eventos de PostHog

| Evento | Cuándo |
| --- | --- |
| `$pageview` / `$pageleave` | Automáticos |
| `cta_hero` / `cta_header` | Botón principal del hero / botón "Unirme" del encabezado |
| `waitlist_form_iniciado` | Primer foco en el formulario |
| `waitlist_form_enviar_click` | Clic en "Unirme a la lista" |
| `waitlist_form_error_validacion` | Dato inválido (`campo`) |
| `waitlist_registro_ok` / `waitlist_registro_error` | Respuesta de Supabase (`pais` / `motivo`) |
| `puerta_falsa_companero` / `_planes_tema` / `_modo_grupo` | Clic en cada puerta |
| `puerta_falsa_email_enviado` | Email dejado en el aviso (`puerta`) |
| `compartir_click` | Botón de compartir (`metodo`) |
| `consentimiento_cookies` | Respuesta al banner (`eleccion`), solo Europa |

## Pendientes antes de publicar

- [x] Verificar el texto de Hechos 17:11 contra la RV1909.
- [x] Banner de consentimiento para visitantes de la UE.
- [x] Imagen para compartir (og:image) de 1200×630.
- [x] Límite anti-spam básico (30 altas por IP por hora).
- [ ] **Completar la política de privacidad** (`landing/privacidad.html`): nombre del responsable, email de contacto, región de Supabase y fecha. Que la revise alguien que sepa de RGPD.
- [ ] Definir el alcance del 50% (¿el primer año?, ¿cuántos son "los primeros"?).
- [ ] En PostHog: activar "Discard client IP data" en la configuración del proyecto.
- [ ] Si igual llega spam: Cloudflare Turnstile (requiere cuenta).
