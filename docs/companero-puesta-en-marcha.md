# Compañero: cómo ponerlo en marcha

El código está listo. Faltan tres cosas que requieren tu cuenta (y una, pagar):

1. **Clave de Anthropic** (pago por uso): creá una cuenta en https://console.anthropic.com, cargá crédito (con USD 5 alcanza para miles de preguntas con Haiku) y generá una API key. **No la pegues en el chat ni en el código.**
2. **Guardarla en Supabase:** Dashboard → Edge Functions → Secrets → `ANTHROPIC_API_KEY` = tu clave. Opcional: `COMPANION_DAILY_LIMIT` (por defecto 30).
3. **Activar login anónimo:** Dashboard → Authentication → Sign In / Providers → *Allow anonymous sign-ins*. Recomendado después: activar CAPTCHA (Turnstile) para que no creen usuarios en masa.

Después yo aplico la migración `20261028200000_companion.sql` y despliego la función, o con la CLI:

```bash
npx supabase db push
npx supabase functions deploy companero
```
