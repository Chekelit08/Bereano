# Proyecto: app cristiana con IA en español

Nombre provisional: **Bereano** (alternativas: Emaús, Pan Diario). Dominio candidato: bereano.app.
Dueño del proyecto: Ezequiel. Respondé siempre en español rioplatense.

## Qué estamos construyendo

Una app de estudio bíblico para hispanohablantes con un compañero de estudio con IA.
No es "otra Biblia": es un acompañante que ayuda a entender, aplicar y sostener el hábito diario.

Público, en este orden:
1. Hispanos en EE.UU. (pagan en dólares).
2. España.
3. LATAM, con precios por país.

Modelo: suscripción por App Store y Google Play (RevenueCat).
- La lectura de la Biblia es gratis siempre.
- El compañero con IA y los planes premium van detrás del paywall, con 7 días de prueba.
- Precio inicial: anual USD 29,99–39,99, mensual USD 6,99. Precios por país en LATAM.

## Funciones del MVP (en este orden)

1. **Lectura** de la Reina-Valera 1909 (dominio público), funciona sin conexión, con buscador de versículos.
2. **Devocional diario**: un pasaje, una reflexión corta y una pregunta para aplicar. Se guarda y se puede compartir como imagen.
3. **Compañero de estudio con IA**: responde preguntas sobre pasajes y temas, siempre anclado en el texto bíblico.
4. **Planes de lectura y racha diaria** (el hábito es lo que retiene).
5. **Paywall** con RevenueCat.

Después del MVP (ideas ya pensadas): comparar versiones, concordancia, significado de palabras en el idioma original, modo grupo para iglesias (planes compartidos).

## Stack

- **App:** Expo (React Native) + TypeScript + Expo Router. Un solo código para iOS y Android.
- **Backend:** Supabase (Auth, Postgres, Edge Functions, Storage).
- **Suscripciones:** RevenueCat.
- **IA:** se llama SOLO desde una Supabase Edge Function. Usar un modelo chico y barato para el compañero (por ejemplo, Claude Haiku) y guardar en caché respuestas a preguntas repetidas.
- **Métricas:** PostHog (eventos, embudos, tests A/B, feature flags para puertas falsas).
- **Landing:** sitio estático en la carpeta `/landing`, publicado en Cloudflare Pages (el plan gratis permite uso comercial).

Estructura sugerida:

```
/app        -> proyecto Expo
/landing    -> landing con lista de espera
/supabase   -> migraciones SQL y edge functions
/docs       -> decisiones y notas
```

## Reglas de seguridad (no negociables)

Las apps hechas con IA suelen filtrar datos por errores de configuración. Antes de terminar cualquier tarea, verificá:

- **RLS activado en TODAS las tablas.** Políticas "solo el dueño": `auth.uid() = user_id`. Nunca "cualquier usuario autenticado puede leer todo".
- Si se activan logins anónimos, revisá que ninguna política use solo "authenticated" como permiso.
- La `service_role` key y las claves de IA viven solo en variables de entorno de las Edge Functions. **Nunca** en la app ni en la landing.
- `.env` en `.gitignore`. Nunca commitear secretos.
- Límite de uso por usuario y por día en el endpoint de IA (evita que alguien nos funda la factura).
- Validar todo lo que entra desde el cliente.
- Lista de espera de la landing: la tabla permite INSERT anónimo y NO permite SELECT a nadie desde el cliente.
- Antes de cada versión: correr una revisión de seguridad completa y listar lo encontrado.

## Reglas de contenido y de la IA

- La base es el texto bíblico. El compañero **siempre cita** libro, capítulo y versículo.
- **Nunca inventar versículos.** Antes de mostrar una respuesta, verificar en la base de datos que cada cita existe y coincide con el texto. Si no hay base bíblica para responder, decirlo.
- Tono: pastoral, claro, respetuoso. Recuerda que no reemplaza a la iglesia local ni a un pastor.
- Línea doctrinal: **[a definir por Ezequiel]**. Hasta definirla, usar un tono evangélico general y presentar con respeto las posturas distintas cuando un tema esté discutido.
- **Situaciones de crisis:** si un usuario expresa ideas de hacerse daño, violencia o una crisis fuerte, la IA responde con cuidado, no da sermones, anima a hablar con alguien de confianza y muestra una pantalla de ayuda con líneas de asistencia de su país. Los números de cada país se verifican antes de publicar.
- Licencias: solo Reina-Valera 1909 hasta tener licencia de otras versiones. La RVR1960 es marca registrada y requiere licencia de Sociedades Bíblicas Unidas.
- Privacidad: política de privacidad clara; no vender datos; las conversaciones del usuario son privadas.

## Diseño

Ezequiel es diseñador gráfico: la UI tiene que verse cuidada.
- Tipografía legible para lectura larga, modo claro y oscuro, tamaño de letra ajustable.
- Que el valor se sienta en el primer minuto: el onboarding lleva directo a una primera experiencia (devocional + una pregunta al compañero).
- Las imágenes para compartir (versículo del día) tienen que verse bien en historias de Instagram.

## Cómo trabajar con Ezequiel

- Estudia Ingeniería en Sistemas: explicá brevemente las decisiones técnicas importantes, sin clases largas.
- Trabajá en pasos chicos que se puedan probar. Commits frecuentes con mensajes claros.
- Si algo requiere pagar, crear cuentas o publicar, frená y avisá antes.
- Tiene entre 10 y 15 horas por semana: priorizá lo que acerca a la validación y al lanzamiento.

## Plan de 90 días (resumen)

- **Semana 1:** nombre, dominio, 10 charlas con potenciales usuarios, landing con lista de espera.
- **Semanas 2–4:** 2 carruseles por día en TikTok/Reels, 3 puertas falsas en la landing. Meta: 100 emails o 1.000 visitas.
- **Semanas 5–8:** MVP de la app (lectura, devocional, compañero IA con límite), revisión de seguridad, prueba con 30–50 personas.
- **Semanas 9–10:** lanzamiento en App Store y Google Play con 7 días gratis.
- **Semanas 11–13:** mejorar onboarding, tests A/B de precio y mensaje, decidir si seguir.

## Comandos útiles

### Landing (`/landing`)

```bash
cd landing
npm install
cp .env.example .env   # completar con las claves públicas
npm run dev            # http://localhost:5173
npm test               # tests de validación
npm run build          # genera landing/dist
```

### Supabase

```bash
npx supabase login
npx supabase link --project-ref annxvazsnzlkeqkrqwfk
npx supabase db push   # aplica supabase/migrations
```

Test de seguridad (migraciones + RLS + anti-spam) en un Postgres temporal, sin Docker:

```bash
./supabase/tests/run-local.sh
```

La CI (`.github/workflows/ci.yml`) corre esto y los tests de la landing en cada push a `main` y en cada PR.

### Deploy

Ver `docs/deploy-cloudflare.md`.
