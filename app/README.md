# Bereano — app

Expo (React Native) + TypeScript + Expo Router. Ver también `AGENTS.md`.

```bash
npm install
npx expo start        # i = iOS, a = Android, w = web
npx tsc --noEmit      # tipos
npx expo lint         # lint
npm run bible         # regenera src/data/bible desde supabase/data/rv1909.json
```

- **Lectura sin conexión:** la Reina-Valera 1909 va adentro de la app (`src/data/bible`, un JSON por libro que se carga recién cuando se abre).
- **Pantallas:** `src/app/index.tsx` (libros), `[book]/index.tsx` (capítulos), `[book]/[chapter].tsx` (lectura), `buscar.tsx` (citas y palabras).
