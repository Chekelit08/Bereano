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

export type Ref = { book: Book; chapter: number; verse?: number };

/** Interpreta "Juan 3:16", "1 cor 13", "salmos 23". Devuelve undefined si no es una cita. */
export function parseReference(input: string): Ref | undefined {
  const m = normalize(input.trim()).match(/^([1-3]?\s*[a-zñ][a-zñ ]*?)\s*(\d+)(?:\s*[:.,]\s*(\d+))?$/);
  if (!m) return undefined;
  const name = m[1].replace(/\s+/g, '');
  if (name.length < 2) return undefined;
  const book =
    books.find((b) => normalize(b.name).replace(/\s+/g, '') === name) ??
    books.find((b) => normalize(b.name).replace(/\s+/g, '').startsWith(name));
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
