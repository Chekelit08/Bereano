# Videos de Bereano (Remotion)

**Video de presentación** (38 s, con voz enérgica y música pop), en dos formatos:

| Composición | Tamaño | Para |
|---|---|---|
| `Presentacion` | 1080×1920 | Reels, TikTok, historias y la app |
| `PresentacionAncha` | 1920×1080 | La landing |

## Comandos

```bash
cd video
npm install
npm run dev                                                   # Remotion Studio para verlo y retocarlo
npx remotion render Presentacion out/bereano-vertical.mp4
npx remotion render PresentacionAncha out/bereano-horizontal.mp4
```

Para subir a las redes, normalizá el volumen (−14 LUFS):

```bash
ffmpeg -i out/bereano-vertical.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5 -c:a aac -b:a 160k out/final.mp4
```

## De dónde sale cada cosa

- **Voz:** Magnific (ElevenLabs v4, voz "Casilda Escudero"), una toma por escena, en `public/voz/`. Las marcas de tiempo de cada palabra están en `src/voz.ts`. De ahí salen los subtítulos y lo que cada escena muestra en sincronía.
  - **Para cambiar el guion:** generá la toma nueva en Magnific, reemplazá el mp3 y actualizá las palabras en `src/voz.ts`.
- **Música:** Magnific (Lyria 3 Pro), `public/musica.mp3`, debajo de la voz (pop movido, 120 bpm).
- **Pantallas:** capturas reales de la app en producción (`node scripts/capturas.mjs`) en `public/app/`.
- **Escenas:** `src/escenas/`:
  - Gancho;
  - Promesa;
  - Devocional;
  - Compañero (la charla de ejemplo de la landing);
  - Planes;
  - Cierre.
- **Reels:** el guion está en `src/reels/guion.ts`. `node --no-warnings scripts/preparar-reels.mjs textos` imprime lo que tiene que decir la voz; con los mp3 en `public/reels/<id>/<n>.mp3`, `... alinear` genera `src/reels/generado.ts`. Después: `npx remotion render Reel-<id>`.
- Las fuentes Inter y Literata, y el logo, son los mismos que usan la landing y la app.

Las guías de Remotion que usamos están en `.claude/skills/`.
