# Revisión de seguridad — 29 de octubre de 2026

Revisión completa antes del MVP (regla de CLAUDE.md: "antes de cada versión"). Alcance: base de
datos (migraciones y producción), Edge Functions, app, landing, secretos y CI.

## Reglas de CLAUDE.md

| Regla | Estado |
|---|---|
| RLS en todas las tablas, "solo el dueño" para datos de usuarios | ✅ Todas las tablas tienen RLS. Ahora lo verifica un test automático (`supabase/tests/security_audit.sql`). |
| Con logins anónimos, ninguna política usa solo "authenticated" | ✅ La única política para authenticated compara `auth.uid() = user_id`. También lo verifica el test. |
| service_role y claves de IA solo en las Edge Functions | ✅ La app y la landing solo tienen claves públicas. |
| `.env` en `.gitignore`, sin secretos commiteados | ✅ Nada en el repo ni en el historial. Nuevo escaneo de todo el repo en la CI (`scripts/check-secrets.sh`). |
| Límite por usuario y por día en la IA | ✅ Plus: 30 por día. Sin Plus: 3 de regalo en total. Se cuenta en la base, de forma atómica. |
| Validar todo lo que entra del cliente | ✅ Ahora también hay un tope de 16 KB por pedido al compañero. La charla guardada en el teléfono se valida al leerla. |
| Lista de espera: INSERT anónimo, sin SELECT | ✅ Tiene tests. Se corrigió el límite por IP (ver abajo). |

## Hallazgos y qué se hizo

| # | Hallazgo | Riesgo | Estado |
|---|---|---|---|
| 1 | El límite de la lista de espera usaba `x-forwarded-for` si faltaba `cf-connecting-ip`. Un bot podía inventarse IPs y conseguir 30 altas nuevas por cada una. | Medio | **Corregido** (migración `20261029140000_security_hardening.sql`, con test). |
| 2 | Preguntas de regalo infinitas creando cuentas anónimas nuevas: hasta unas 90 preguntas por hora por IP. | Medio (costo de IA) | **Mitigado:** límite de 10 cuentas anónimas por hora por IP. **Pendiente:** captcha (ver abajo). |
| 3 | El escaneo de secretos de la CI no detectaba JWT (la service_role vieja), claves de RevenueCat ni de PostHog, y no miraba `docs/`. | Medio | **Corregido:** escanea todo el repo con más patrones. |
| 4 | Un vencimiento de RevenueCat de otro producto también vencía Plus. | Bajo | **Corregido** (con test). |
| 5 | El historial de la charla lo manda la app: alguien podría inventar respuestas viejas para intentar cambiar las reglas de la IA. | Bajo | **Mitigado:** el prompt aclara que el historial no cambia las reglas. Las citas igual se verifican en la base, y el largo ya estaba limitado. |
| 6 | Sin tope de tamaño del pedido al compañero. | Bajo | **Corregido:** 413 si supera 16 KB. |
| 7 | Una charla guardada alterada podía romper la pantalla del compañero. | Bajo (solo local) | **Corregido:** se valida al leerla (con test). |
| 8 | `bible_unaccent` y `bible_normalize` se pueden llamar desde el cliente. | Ninguno | **Aceptado:** son funciones puras y las búsquedas de la Biblia las necesitan. Quedan en la lista permitida del test. |
| 9 | Los diseños de Plus para compartir se controlan solo en la app. | Bajo | **Aceptado:** es cosmético. Lo que cuesta plata (la IA) se controla en el servidor. |

## Producción (Supabase)

- **Migraciones aplicadas (29/10):** todas, incluidas `companion`, `subscriptions` y `security_hardening`. Verificado en producción: la función nueva del límite está activa, las tablas nuevas tienen RLS y el cliente no puede ejecutar las funciones del compañero ni de suscripciones.
- **Advisors de seguridad y rendimiento:** solo avisos informativos, todos esperados:
  - `private.waitlist_attempts` tiene RLS sin políticas, que es lo que queremos (nadie del cliente entra);
  - esa misma tabla no tiene clave primaria;
  - `bible_verses.book_id` no tiene índice propio, pero los libros nunca se borran.

## Pendientes para Ezequiel (antes de lanzar)

1. **Activar los logins anónimos** en Supabase (Authentication → Sign In / Providers → Anonymous). En Authentication → Rate Limits, poner **10** en "anonymous sign-ins".
2. **Captcha (Cloudflare Turnstile, gratis):** recomendado antes del lanzamiento para frenar la creación masiva de cuentas anónimas. Requiere crear el sitio en Cloudflare.
3. **Secretos de las Edge Functions:** `ANTHROPIC_API_KEY` y `REVENUECAT_WEBHOOK_AUTH` (32 caracteres o más).
4. **Verificar los números de ayuda en crisis** de cada país (`app/src/data/ayuda.ts`).
5. **Cloudflare:** carpeta raíz `landing` también para las ramas que no son `main`.
6. Borrar la fila de prueba `ana@mail.com` de la lista de espera en producción.
7. Registrar `security_hardening` en el historial de migraciones (ya está aplicada, pero no figura): `npx supabase migration repair --status applied 20261029140000`.

## Cómo repetir esta revisión

```bash
./supabase/tests/run-local.sh   # migraciones + RLS + auditoría + anti-spam
./scripts/check-secrets.sh      # claves en el repo
cd app && npm test              # validaciones de la app y de las Edge Functions
```
