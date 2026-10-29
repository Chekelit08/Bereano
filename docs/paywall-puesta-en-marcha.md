# Paywall (Bereano Plus): cómo ponerlo en marcha

El código está listo y funciona en **modo demostración** (no cobra). Para cobrar de verdad hacen falta cuentas y pagos: lo hace Ezequiel.

## Qué incluye Plus
- Compañero con IA: hasta 30 preguntas por día (sin Plus: 3 de regalo en total).
- Planes por tema (el día 1 de cada uno es gratis). El plan de Juan, la Biblia, el buscador y el devocional siguen gratis siempre.
- Precios: anual USD 39,99 con 7 días gratis, mensual USD 6,99.

## Pasos
1. **Cuentas de desarrollador**: Apple Developer Program (USD 99/año) y Google Play Console (USD 25 una vez).
2. **Productos en las tiendas** (suscripciones, mismo grupo):
   - `bereano_plus_anual`: USD 39,99/año, con oferta introductoria de 7 días gratis.
   - `bereano_plus_mensual`: USD 6,99/mes.
   - Precios por país en LATAM desde cada tienda.
3. **RevenueCat** (gratis hasta USD 2.500 de ingresos por mes):
   - Crear el proyecto y conectar las dos tiendas.
   - Entitlement `plus` con los dos productos; offering `default` con los paquetes **Annual** y **Monthly**.
   - Copiar las claves públicas del SDK y ponerlas en `app/.env`:
     `EXPO_PUBLIC_REVENUECAT_IOS_KEY=...` y `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=...` (son públicas, pensadas para la app).
4. **Webhook** (para que el servidor sepa quién es Plus):
   - Inventar un secreto largo (32+ caracteres) y guardarlo en Supabase → Edge Functions → Secrets como `REVENUECAT_WEBHOOK_AUTH` (con el formato exacto que se ponga en RevenueCat, por ejemplo `Bearer xxxxx`).
   - En RevenueCat → Integrations → Webhooks: URL `https://annxvazsnzlkeqkrqwfk.supabase.co/functions/v1/revenuecat-webhook` y en *Authorization header* el mismo valor.
   - Aplicar la migración `20261029120000_subscriptions.sql` y desplegar `revenuecat-webhook` y `companero` (lo hago yo cuando me digas).
5. **Build de desarrollo**: las compras reales no funcionan en Expo Go. Con EAS (cuenta gratis de Expo): `npx eas build --profile development`.

## Seguridad
- La app solo *muestra* si sos Plus. Quien decide es el servidor: el compañero consulta `is_plus` antes de responder.
- `subscriptions` la escribe solo el webhook; cada usuario puede leer únicamente su fila (`auth.uid() = user_id`).
