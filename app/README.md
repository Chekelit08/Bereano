# Bereano — app

Expo (React Native) + TypeScript + Expo Router. Ver también `AGENTS.md`.

```bash
npm install
npx expo start        # i = iOS, a = Android, w = web
npx tsc --noEmit      # tipos
npx expo lint         # lint
npm test              # citas, búsqueda y devocionales
npm run bible         # regenera src/data/bible desde supabase/data/rv1909.json
```

- **Lectura sin conexión:** la Reina-Valera 1909 va adentro de la app (`src/data/bible`, un JSON por libro que se carga recién cuando se abre).
- **Pantallas:** pestañas `(tabs)/index.tsx` (Hoy: devocional) y `(tabs)/biblia.tsx` (libros por sección); `[book]/index.tsx` (capítulos), `[book]/[chapter].tsx` (lectura), `buscar.tsx` (citas y palabras), `devocional/[id].tsx` (guardados).
- **Devocionales:** `src/data/devocionales.ts`. El pasaje sale siempre de la Biblia de la app y los tests verifican que todo lo citado entre «» esté textual. Son un borrador: revisarlos antes de publicar.
