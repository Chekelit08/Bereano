import { shareText } from '@/data/devocionales';
import { formatRef, getBook, getChapter } from '@/lib/bible';

export const MAX_SHARE_VERSES = 5;
/** Más que esto no entra bien en una historia. */
export const MAX_SHARE_CHARS = 320;

/** Valida el pasaje que llega por la URL y arma el texto y la cita (siempre de la Biblia de la app). */
export function sharePassage(p: { book?: string; chapter?: string; from?: string; to?: string }) {
  const book = getBook(p.book);
  const chapter = Number(p.chapter);
  const verses = book && Number.isInteger(chapter) ? getChapter(book.code, chapter) : undefined;
  if (!book || !verses) return null;
  const from = Number(p.from);
  const to = p.to === undefined ? from : Number(p.to);
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 1 || to < from || to > verses.length)
    return null;
  if (to - from + 1 > MAX_SHARE_VERSES) return null;
  const text = shareText(verses.slice(from - 1, to));
  return { text, reference: formatRef(book, chapter, from, to), tooLong: text.length > MAX_SHARE_CHARS };
}
