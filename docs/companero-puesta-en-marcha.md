# Compañero: cómo ponerlo en marcha

El código está listo. Faltan tres cosas que requieren tu cuenta (y una, pagar):

1. **Clave de Anthropic** (pago por uso): creá una cuenta en https://console.anthropic.com, cargá crédito (con USD 5 alcanza para miles de preguntas con Haiku) y generá una API key. **No la pegues en el chat ni en el código.**
2. **Guardarla en Supabase:** Dashboard → Edge Functions → Secrets → `ANTHROPIC_API_KEY` = tu clave. Opcional: `COMPANION_DAILY_LIMIT` (por defecto 30).
3. **Activar login anónimo:** Dashboard → Authentication → Sign In / Providers → *Allow anonymous sign-ins*. Recomendado después: activar CAPTCHA (Turnstile) para que no creen usuarios en masa.

La migración `20261029132057_companion.sql` ya está aplicada en producción. Falta desplegar la función (lo hago yo cuando esté la clave), o con la CLI:

```bash
npx supabase db push
npx supabase functions deploy companero
```
