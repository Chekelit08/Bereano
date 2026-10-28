import booksData from '@/data/bible/books.json';
import { bookText } from '@/data/bible/text';

export type Book = {
  id: number;
  code: string; // código USFM en minúscula, se usa en la URL: /jhn/3
  name: string;
  testament: 'AT' | 'NT';
  chapters: number;
};

export const books = booksData as Book[];
export const VERSION = 'Reina-Valera 1909';

const byCode = new Map(books.map((b) => [b.code, b]));

export function getBook(code: string | undefined): Book | undefined {
  return code ? byCode.get(code.toLowerCase()) : undefined;
}

/** Versículos de un capítulo (el índice 0 es el versículo 1), o undefined si no existe. */
export function getChapter(code: string, chapter: number): string[] | undefined {
  const load = bookText[code];
  return load?.()[chapter - 1];
}

/** Capítulo anterior y siguiente, cruzando de un libro a otro. */
export function neighbors(book: Book, chapter: number) {
  const prevBook = books[book.id - 2];
  const nextBook = books[book.id];
  const prev =
    chapter > 1
      ? { book, chapter: chapter - 1 }
      : prevBook
        ? { book: prevBook, chapter: prevBook.chapters }
        : null;
  const next =
    chapter < book.chapters
      ? { book, chapter: chapter + 1 }
      : nextBook
        ? { book: nextBook, chapter: 1 }
        : null;
  return { prev, next };
}

/** Para buscar sin importar acentos ni mayúsculas (como bible_normalize en la base). */
export function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Secciones tradicionales del canon, para ordenar la lista de libros. */
export const SECTIONS: { title: string; testament: 'AT' | 'NT'; from: number; to: number }[] = [
  { title: 'Pentateuco', testament: 'AT', from: 1, to: 5 },
  { title: 'Libros históricos', testament: 'AT', from: 6, to: 17 },
  { title: 'Libros poéticos', testament: 'AT', from: 18, to: 22 },
  { title: 'Profetas mayores', testament: 'AT', from: 23, to: 27 },
  { title: 'Profetas menores', testament: 'AT', from: 28, to: 39 },
  { title: 'Evangelios', testament: 'NT', from: 40, to: 43 },
  { title: 'Historia de la iglesia', testament: 'NT', from: 44, to: 44 },
  { title: 'Cartas de Pablo', testament: 'NT', from: 45, to: 57 },
  { title: 'Cartas generales', testament: 'NT', from: 58, to: 65 },
  { title: 'Profecía', testament: 'NT', from: 66, to: 66 },
];

/** Abreviaturas comunes en español (sin acentos ni espacios) -> código del libro. */
const ABBREVIATIONS: Record<string, string> = {
  gn: 'gen',
  ex: 'exo',
  lv: 'lev',
  nm: 'num',
  dt: 'deu',
  jos: 'jos',
  jue: 'jdg',
  jc: 'jdg',
  rt: 'rut',
  '1s': '1sa',
  '2s': '2sa',
  '1r': '1ki',
  '2r': '2ki',
  '1cr': '1ch',
  '2cr': '2ch',
  esd: 'ezr',
  neh: 'neh',
  est: 'est',
  jb: 'job',
  sal: 'psa',
  salmo: 'psa',
  sl: 'psa',
  pr: 'pro',
  prov: 'pro',
  ec: 'ecc',
  ecl: 'ecc',
  cnt: 'sng',
  cant: 'sng',
  cantar: 'sng',
  cantardeloscantares: 'sng',
  is: 'isa',
  jr: 'jer',
  lm: 'lam',
  ez: 'ezk',
  dn: 'dan',
  os: 'hos',
  jl: 'jol',
  am: 'amo',
  abd: 'oba',
  jon: 'jon',
  mi: 'mic',
  nah: 'nam',
  hab: 'hab',
  sof: 'zep',
  hag: 'hag',
  zac: 'zec',
  mal: 'mal',
  mt: 'mat',
  mc: 'mrk',
  mr: 'mrk',
  lc: 'luk',
  jn: 'jhn',
  hch: 'act',
  hech: 'act',
  ro: 'rom',
  rm: 'rom',
  '1co': '1co',
  '2co': '2co',
  ga: 'gal',
  gl: 'gal',
  ef: 'eph',
  fil: 'php',
  flp: 'php',
  col: 'col',
  '1ts': '1th',
  '2ts': '2th',
  '1tes': '1th',
  '2tes': '2th',
  '1ti': '1ti',
  '2ti': '2ti',
  tit: 'tit',
  flm: 'phm',
  heb: 'heb',
  stg: 'jas',
  sant: 'jas',
  '1p': '1pe',
  '2p': '2pe',
  '1jn': '1jn',
  '2jn': '2jn',
  '3jn': '3jn',
  jud: 'jud',
  ap: 'rev',
  apoc: 'rev',
};

const compact = (s: string) => normalize(s).replace(/[^a-z0-9ñ]/g, '');

function findBook(name: string): Book | undefined {
  const n = compact(
    normalize(name)
      .trim()
      .replace(/^(primera|primer|primero|i)\s+/, '1')
      .replace(/^(segunda|segundo|ii)\s+/, '2')
      .replace(/^(tercera|tercer|tercero|iii)\s+/, '3'),
  );
  if (!n) return undefined;
  return (
    books.find((b) => compact(b.name) === n) ??
    getBook(ABBREVIATIONS[n]) ??
    (n.length >= 2 ? books.find((b) => compact(b.name).startsWith(n)) : undefined)
  );
}

export type Ref = { book: Book; chapter: number; verse?: number };

/**
 * Interpreta una cita escrita como sea: "Juan 3:16", "juan 3 16", "Jn 3.16", "1 cor 13",
 * "Salmo 23", "Romanos 8:28-30" (va al primer versículo). Undefined si no es una cita válida.
 */
export function parseReference(input: string): Ref | undefined {
  const m = normalize(input.trim()).match(
    /^((?:[1-3]\s*)?[a-zñ][a-zñ .]*?)\.?\s*(\d{1,3})(?:(?:\s*[:.,]\s*|\s+)(\d{1,3}))?(?:\s*-\s*\d{1,3})?$/,
  );
  if (!m) return undefined;
  const book = findBook(m[1]);
  if (!book) return undefined;
  const chapter = Number(m[2]);
  if (chapter < 1 || chapter > book.chapters) return undefined;
  const verse = m[3] ? Number(m[3]) : undefined;
  if (verse !== undefined && (verse < 1 || verse > (getChapter(book.code, chapter)?.length ?? 0)))
    return undefined;
  return { book, chapter, verse };
}

export type Hit = { book: Book; chapter: number; verse: number; text: string };

/** Búsqueda de texto sin conexión: todas las palabras tienen que aparecer en el versículo. */
export function searchText(query: string, limit = 100): Hit[] {
  const words = normalize(query)
    .split(/[^a-zñ0-9]+/)
    .filter((w) => w.length > 1);
  if (!words.length) return [];
  const phrase = normalize(query).trim();
  const hits: (Hit & { exact: boolean })[] = [];
  for (const book of books) {
    const chapters = bookText[book.code]();
    chapters.forEach((verses, c) =>
      verses.forEach((text, v) => {
        const n = normalize(text);
        if (words.every((w) => n.includes(w))) {
          hits.push({ book, chapter: c + 1, verse: v + 1, text, exact: n.includes(phrase) });
        }
      }),
    );
  }
  // Primero los que tienen la frase exacta, después en orden bíblico.
  return hits
    .sort((a, b) => Number(b.exact) - Number(a.exact))
    .slice(0, limit)
    .map(({ exact: _exact, ...h }) => h);
}

/** "Salmos 23:1-4", "Josué 1:9". */
export function formatRef(book: Book, chapter: number, from: number, to = from): string {
  return `${book.name} ${chapter}:${from}${to > from ? `-${to}` : ''}`;
}
