import type { ChatMessage, CompanionCitation } from '@/lib/companero';

const isInt = (n: unknown): n is number => Number.isInteger(n) && (n as number) > 0;

function parseCitation(c: unknown): CompanionCitation | null {
  if (!c || typeof c !== 'object') return null;
  const v = c as Record<string, unknown>;
  if (typeof v.ref !== 'string' || typeof v.code !== 'string' || !/^[1-3a-z][a-z0-9]{2}$/.test(v.code))
    return null;
  if (!isInt(v.chapter) || !isInt(v.from) || !isInt(v.to) || !Array.isArray(v.text)) return null;
  return {
    ref: v.ref.slice(0, 60),
    code: v.code,
    chapter: v.chapter,
    from: v.from,
    to: v.to,
    text: v.text.filter((t): t is string => typeof t === 'string'),
  };
}

/** Valida la charla guardada en el teléfono: si alguien la toca, la app no se rompe. */
export function parseChat(v: unknown): ChatMessage[] {
  if (!Array.isArray(v)) return [];
  const out: ChatMessage[] = [];
  for (const m of v) {
    if (!m || typeof m !== 'object' || typeof m.text !== 'string') continue;
    const id = typeof m.id === 'string' ? m.id.slice(0, 40) : String(out.length);
    if (m.role === 'user') out.push({ id, role: 'user', text: m.text });
    else if (m.role === 'assistant')
      out.push({
        id,
        role: 'assistant',
        text: m.text,
        citations: Array.isArray(m.citations)
          ? m.citations
              .map(parseCitation)
              .filter((c: CompanionCitation | null): c is CompanionCitation => !!c)
          : [],
        ...(m.noBiblicalBasis === true && { noBiblicalBasis: true }),
      });
  }
  return out;
}
