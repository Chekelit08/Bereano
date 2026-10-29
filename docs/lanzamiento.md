# Lanzamiento en App Store y Google Play

Guía paso a paso. Lo marcado con 💳 **cuesta plata o crea cuentas: lo hace Ezequiel**.

## 0. Antes de empezar (pendientes de la revisión de seguridad)

- [ ] Supabase: activar los logins anónimos (Authentication → Sign In / Providers → Anonymous). En Authentication → Rate Limits, poner **10** en "anonymous sign-ins".
- [ ] Secretos de las Edge Functions: `ANTHROPIC_API_KEY` y `REVENUECAT_WEBHOOK_AUTH`. Después, Claude despliega `companero` y `revenuecat-webhook`.
- [ ] Verificar los números de ayuda en crisis (`app/src/data/ayuda.ts`).
- [ ] Completar en `landing/privacidad.html` y `landing/terminos.html`: nombre, país, email de contacto y fecha.
- [ ] Revisar los devocionales y las preguntas de los planes.

## 1. Cuentas 💳

| Cuenta | Costo | Para qué |
|---|---|---|
| Apple Developer Program | USD 99 por año | Publicar en App Store y TestFlight |
| Google Play Console | USD 25, una sola vez | Publicar en Google Play |
| Expo (EAS) | Gratis (con builds limitados por mes) | Compilar la app en la nube y subirla a las tiendas |
| RevenueCat | Gratis hasta USD 2.500 de ingresos por mes | Suscripciones (ver `paywall-puesta-en-marcha.md`) |

Google Play pide, para cuentas personales nuevas, una **prueba cerrada con al menos 12 personas durante 14 días** antes de publicar. Conviene arrancarla junto con la prueba de 30 a 50 personas del plan.

## 2. Preparar el proyecto en EAS

En la Mac, dentro de `~/bereano/app`:

```bash
npm install -g eas-cli
```

```bash
eas login
```

```bash
eas init
```

`eas init` agrega el `projectId` a `app.json`: commitealo.

Después cargá las claves públicas de RevenueCat como variables de EAS:

```bash
eas env:create --name EXPO_PUBLIC_REVENUECAT_IOS_KEY --value appl_xxx --environment production --environment preview --environment development --visibility plaintext
```

```bash
eas env:create --name EXPO_PUBLIC_REVENUECAT_ANDROID_KEY --value goog_xxx --environment production --environment preview --environment development --visibility plaintext
```

Identificadores (ya están en `app.json`): `app.bereano` para iOS y para Android.

## 3. Probar con un build de desarrollo (compras reales en modo prueba)

```bash
eas build --profile development --platform ios
```

```bash
eas build --profile development --platform android
```

Se instala en el celular desde el link que da EAS. Con este build, RevenueCat usa el sandbox de las tiendas: se puede probar la compra sin pagar.

## 4. Prueba con 30 a 50 personas

- **iOS:** `eas build --profile production --platform ios` y después `eas submit --platform ios`. Queda en **TestFlight**: se invita por email o con un link público.
- **Android:** `eas build --profile production --platform android` y después `eas submit --platform android`. Va a **Prueba cerrada** en Play Console. Ahí se agregan los testers, que tienen que ser 12 o más durante 14 días.

## 5. Ficha de las tiendas

**Nombre (30 caracteres):** `Bereano: Biblia y estudio`

**Subtítulo iOS (30):** `Tu compañero de estudio bíblico`

**Descripción corta Android (80):** `Lee la Biblia, entiéndela y vuelve a ella cada día con un compañero con IA.`

**Palabras clave iOS (100, separadas por comas, sin espacios):**
`biblia,devocional,versiculo,reina valera,estudio biblico,oracion,cristiano,iglesia,planes,fe`

**Descripción:**

> Bereano te acompaña a leer la Biblia, entenderla y volver a ella cada día.
>
> • **Un momento por día:** un pasaje, una reflexión corta y una pregunta para aplicar.
> • **Compañero de estudio:** pregúntale sobre un pasaje o un tema. Responde siempre con citas de la Biblia, verificadas contra el texto. Si no hay base bíblica, te lo dice.
> • **La Biblia completa, gratis y sin conexión:** Reina-Valera 1909, con buscador ("Juan 3 16" o una frase).
> • **Planes de lectura:** el Evangelio de Juan gratis, y planes por tema (ansiedad, perdón, familia, duelo, fe en la tormenta).
> • **Versículo del día para tus historias:** tres diseños nuevos cada día.
> • **Tu racha:** el hábito se construye de a un día.
>
> Bereano Plus suma el compañero sin límite de regalo (hasta 30 preguntas por día), todos los planes por tema y todos los diseños para compartir cualquier versículo. El plan anual incluye 7 días gratis.
>
> Bereano no reemplaza a tu iglesia ni a tu pastor: es un compañero para tu tiempo con Dios.
>
> Términos: https://bereano.app/terminos · Privacidad: https://bereano.app/privacidad

Si el dominio todavía no está, en esos dos links usar `bereano.ezeadenett.workers.dev`.

**Categoría:** Referencia, con Libros como secundaria.

**Edad:** iOS 13+ (por las respuestas generadas con IA), Android "Todos" / PEGI 3 según el cuestionario. Responder que **no** hay contenido generado por usuarios visible para otros.

## 6. Privacidad en las tiendas

**Apple, "App Privacy":**

| Dato | Vinculado al usuario | Uso | Rastreo |
|---|---|---|---|
| Identificadores → ID de usuario (anónimo) | Sí | Funcionalidad de la app | No |
| Compras → Historial de compras | Sí | Funcionalidad de la app | No |
| Contenido del usuario → Otro (preguntas al compañero) | No | Funcionalidad de la app | No |

**Google, "Seguridad de los datos":** se declaran los mismos datos:
- datos cifrados en tránsito: sí;
- se pueden borrar: sí, pidiéndolo por email;
- no se comparten con terceros para publicidad.

## 7. Notas para la revisión de Apple

> Bereano no requiere cuenta: crea un identificador anónimo. El compañero de estudio usa IA (Anthropic) y verifica cada cita bíblica contra la base de datos antes de mostrarla. Si una pregunta muestra señales de crisis, no se envía a la IA y la app muestra líneas de ayuda. Sin suscripción hay 3 preguntas de regalo para probar el compañero. Términos y privacidad están enlazados en la pantalla de suscripción.

## 8. Capturas

Hacen falta capturas de **6,9" (1320 × 2868)** para iOS y de teléfono para Android.

Propuesta de 6 capturas, con un título arriba de cada una:
1. "Un momento con Dios cada día" (Hoy).
2. "Pregunta y recibe respuestas con la Biblia" (Compañero).
3. "La Biblia completa, sin conexión" (Lector).
4. "Planes para cada momento" (Planes).
5. "Tu versículo, listo para tus historias" (Diseños).
6. "Tu racha, de a un día" (Hoy con racha).

Claude puede generarlas desde la versión web una vez que se aprueben los textos.

## 9. Publicar

Cuando la prueba esté bien: en App Store Connect, **Enviar para revisión**; en Play Console, **Producción → Crear versión**. Activar los productos de suscripción y la prueba de 7 días en las dos tiendas antes de enviar.
