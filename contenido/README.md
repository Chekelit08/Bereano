# Carruseles para TikTok y Reels

Arma **2 carruseles por día**, listos para subir:

1. **"Versículos para…"**: un tema por día (ansiedad, duelo, familia…), con portada gancho, 5 versículos y cierre.
2. **"Devocional en 1 minuto"**: el mismo devocional que ese día muestra la app, con el pasaje, la reflexión y la pregunta para comentar.

El texto bíblico sale siempre de la Biblia de la app (Reina-Valera 1909). Nada se escribe a mano, así que no se puede colar un versículo inventado.

## Uso

Necesita Node 22 y Playwright, que ya está en el entorno de Claude; en tu compu: `npx playwright install chromium`. Usa las fuentes de la landing, así que antes corré una vez `cd landing && npm install`.

```bash
cd contenido
npm run carruseles -- --desde 2026-11-05 --dias 14
npm run carruseles -- --desde 2026-11-05 --dias 14 --formato historia   # 1080×1920
npm test
```

Queda en `contenido/salida/AAAA-MM-DD/1-tema-…/` y `2-devocional-…/`:

- `01.png`, `02.png`, …: las láminas, en 1080×1350, el 4:5 que va en Instagram y en el modo foto de TikTok;
- `texto.txt`: el texto del posteo, con la cita, el llamado a la acción y los hashtags.

## Cómo cambiar cosas

- **Ganchos de portada:** `ganchos.json`, 2 por tema; se alternan.
- **Diseño:** `plantillas/carrusel.css`. Respetá los márgenes seguros: nada importante abajo ni a la derecha, donde TikTok pone los botones.
- **Temas y devocionales:** salen de `app/src/data/temas.ts` y `app/src/data/devocionales.ts`. Lo que agregues ahí aparece solo.

Ideas para la oferta y el mensaje: `docs/oferta.md`.
