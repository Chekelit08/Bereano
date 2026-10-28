// Genera los datos de la Biblia que van adentro de la app (lectura sin conexión).
// Fuente: supabase/data/rv1909.json (el mismo texto que está en la base) y la lista de
// libros de la migración. Uso: node scripts/build-bible.mjs
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const out = join(root, 'app', 'src', 'data', 'bible');

const sql = readFileSync(join(root, 'supabase/migrations/20261028172010_bible.sql'), 'utf8');
const books = [...sql.matchAll(/^\s*\((\d+), '([1-3A-Z][A-Z0-9]{2})', '([^']+)', '(AT|NT)', (\d+)\)/gm)].map(
  ([, id, code, name, testament, chapters]) => ({
    id: +id,
    code: code.toLowerCase(),
    name,
    testament,
    chapters: +chapters,
  }),
);
if (books.length !== 66) throw new Error(`Esperaba 66 libros, encontré ${books.length}`);

const { verses } = JSON.parse(readFileSync(join(root, 'supabase/data/rv1909.json'), 'utf8'));
const text = books.map((b) => Array.from({ length: b.chapters }, () => []));
for (const [book, chapter, verse, t] of verses) {
  const ch = text[book - 1][chapter - 1];
  if (verse !== ch.length + 1) throw new Error(`Versículo fuera de orden: ${book} ${chapter}:${verse}`);
  ch.push(t);
}
text.forEach((chs, i) =>
  chs.forEach((c, j) => {
    if (!c.length) throw new Error(`Capítulo vacío: ${books[i].name} ${j + 1}`);
  }),
);

rmSync(join(out, 'text'), { recursive: true, force: true });
mkdirSync(join(out, 'text'), { recursive: true });
writeFileSync(join(out, 'books.json'), JSON.stringify(books, null, 1) + '\n');
books.forEach((b, i) => writeFileSync(join(out, 'text', `${b.code}.json`), JSON.stringify(text[i])));

// Un require por libro: Metro solo evalúa el JSON del libro que se abre.
const loaders = books
  .map((b) => `  ${JSON.stringify(b.code)}: () => require('./${b.code}.json'),`)
  .join('\n');
writeFileSync(
  join(out, 'text', 'index.ts'),
  `// Generado por scripts/build-bible.mjs. No editar a mano.\n` +
    `export const bookText: Record<string, () => string[][]> = {\n${loaders}\n};\n`,
);
console.log(`${books.length} libros, ${verses.length} versículos -> ${out}`);
