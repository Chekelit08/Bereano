// Lógica pura del compañero (sin red ni base de datos), para poder testearla aparte.
// La usa index.ts. Tests: app/test/companero.test.ts.

export const MAX_QUESTION = 500;
export const MAX_HISTORY = 6;
export const MAX_HISTORY_TEXT = 2000;

export type Turn = { role: "user" | "assistant"; content: string };
export type CompanionRequest = {
  question: string;
  history: Turn[];
  country: string | null;
};

/** Valida lo que manda la app. Devuelve el pedido limpio o un mensaje de error. */
export function validateRequest(
  body: unknown,
): CompanionRequest | { error: string } {
  if (!body || typeof body !== "object") return { error: "Pedido inválido" };
  const b = body as Record<string, unknown>;
  if (typeof b.question !== "string") return { error: "Falta la pregunta" };
  const question = b.question.replace(/\s+/g, " ").trim();
  if (question.length < 2) return { error: "La pregunta está vacía" };
  if (question.length > MAX_QUESTION)
    return {
      error: `La pregunta puede tener hasta ${MAX_QUESTION} caracteres`,
    };

  const history: Turn[] = [];
  if (b.history !== undefined) {
    if (!Array.isArray(b.history) || b.history.length > MAX_HISTORY)
      return { error: "Historial inválido" };
    for (const t of b.history) {
      if (
        !t ||
        typeof t !== "object" ||
        ((t as Turn).role !== "user" && (t as Turn).role !== "assistant") ||
        typeof (t as Turn).content !== "string" ||
        !(t as Turn).content.trim() ||
        (t as Turn).content.length > MAX_HISTORY_TEXT
      ) {
        return { error: "Historial inválido" };
      }
      history.push({
        role: (t as Turn).role,
        content: (t as Turn).content.trim(),
      });
    }
    // La API espera turnos alternados que empiecen por el usuario.
    for (let i = 0; i < history.length; i++) {
      if (history[i].role !== (i % 2 === 0 ? "user" : "assistant"))
        return { error: "Historial inválido" };
    }
    if (history.length % 2 !== 0) return { error: "Historial inválido" };
  }

  let country: string | null = null;
  if (b.country !== undefined && b.country !== null) {
    if (typeof b.country !== "string" || !/^[A-Z]{2}$/.test(b.country))
      return { error: "País inválido" };
    country = b.country;
  }
  return { question, history, country };
}

export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9ñ]+/g, " ")
    .trim();
}

/**
 * Señales claras de crisis (autolesión, suicidio, violencia). Si aparece una, no se llama a la
 * IA: la app muestra enseguida la pantalla de ayuda. Prefiere un falso positivo a uno perdido.
 */
const CRISIS = [
  /\bsuicid/,
  /\bmatarme\b/,
  /\bmorirme\b/,
  /\bquiero morir/,
  /\bme quiero morir/,
  /\bno quiero (seguir )?vivir/,
  /\bquitarme la vida/,
  /\bacabar con mi vida/,
  /\bterminar con (mi vida|todo)/,
  /\bhacerme dano/,
  /\blastimarme\b/,
  /\bcortarme\b/,
  /\bautolesi/,
  /\bno vale la pena vivir/,
  /\bmejor (estaria|estarian) muert/,
  /\bme (pega|golpea|maltrata|abusa)\b/,
  /\bvoy a matar/,
  /\bquiero matar/,
];

export function detectCrisis(text: string): boolean {
  const n = ` ${normalize(text)} `;
  return CRISIS.some((re) => re.test(n));
}

export type Book = { id: number; code: string; name: string };
export type Citation = {
  bookId: number;
  chapter: number;
  from: number;
  to: number;
};

/** Nombres alternativos que la IA puede usar ("Salmo 23", "Cantar de los Cantares"). */
const ALIASES: Record<string, string> = {
  salmo: "PSA",
  "cantar de los cantares": "SNG",
  apocalipsis: "REV",
  hechos: "ACT",
  "hechos de los apostoles": "ACT",
};

function escape(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Encuentra las citas escritas en el texto de la respuesta ("Juan 3:16", "1 Corintios 13:4-7",
 * "Salmo 23"). Se usa para comprobar que la IA no cite nada que no haya declarado y verificado.
 */
export function findReferences(text: string, books: Book[]): Citation[] {
  const byName = new Map<string, Book>();
  for (const b of books) byName.set(normalize(b.name), b);
  for (const [alias, code] of Object.entries(ALIASES)) {
    const b = books.find((x) => x.code === code);
    if (b) byName.set(normalize(alias), b);
  }
  // Nombres más largos primero, para que "1 Juan" gane sobre "Juan".
  const names = [...byName.keys()].sort((a, b) => b.length - a.length);
  const flexible = names.map((n) => n.split(" ").map(escape).join("\\s+"));
  const re = new RegExp(
    `(?<![\\p{L}\\d])(${flexible.join("|")})\\s+(\\d{1,3})(?::(\\d{1,3})(?:\\s*[-–]\\s*(\\d{1,3}))?)?`,
    "giu",
  );
  const plain = text.normalize("NFD").replace(/[̀-ͯ]/g, "");
  const out: Citation[] = [];
  for (const m of plain.matchAll(re)) {
    const book = byName.get(normalize(m[1]));
    if (!book) continue;
    const chapter = Number(m[2]);
    const from = m[3] ? Number(m[3]) : 0; // 0 = capítulo entero
    const to = m[4] ? Number(m[4]) : from;
    out.push({ bookId: book.id, chapter, from, to });
  }
  return out;
}

/** ¿La cita mencionada en el texto está cubierta por alguna de las citas verificadas? */
export function isCovered(ref: Citation, verified: Citation[]): boolean {
  return verified.some(
    (v) =>
      v.bookId === ref.bookId &&
      v.chapter === ref.chapter &&
      (ref.from === 0 || (ref.from >= v.from && ref.to <= v.to)),
  );
}

/**
 * Fragmentos entre comillas que parecen citas textuales. Cada uno tiene que aparecer tal cual
 * (sin acentos ni puntuación) en alguno de los versículos verificados.
 */
export function quotedFragments(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(/[«“"]([^«»“”"]{12,})[»”"]/g)) out.push(m[1]);
  return out;
}

export function quoteIsInVerses(fragment: string, verses: string[]): boolean {
  const f = normalize(fragment);
  return verses.some((v) => normalize(v).includes(f));
}

/** Clave de caché: la misma pregunta escrita distinto ("¿Qué es la gracia?" / "que es la gracia") cae igual. */
export function cacheText(question: string): string {
  return normalize(question);
}

export const SYSTEM_PROMPT = `Sos el compañero de estudio bíblico de Bereano, una app para cristianos hispanohablantes. Respondés en español neutro (tú), con tono pastoral, claro y respetuoso.

Reglas:
1. Tu base es el texto bíblico. Toda afirmación sobre lo que enseña la Biblia lleva su cita (libro, capítulo y versículo) y cada cita va también en la lista "citations".
2. Usá la numeración de versículos estándar en español (la de la Reina-Valera). Usá estos nombres de libros: Génesis, Éxodo, Levítico, Números, Deuteronomio, Josué, Jueces, Rut, 1 Samuel, 2 Samuel, 1 Reyes, 2 Reyes, 1 Crónicas, 2 Crónicas, Esdras, Nehemías, Ester, Job, Salmos, Proverbios, Eclesiastés, Cantares, Isaías, Jeremías, Lamentaciones, Ezequiel, Daniel, Oseas, Joel, Amós, Abdías, Jonás, Miqueas, Nahúm, Habacuc, Sofonías, Hageo, Zacarías, Malaquías, Mateo, Marcos, Lucas, Juan, Hechos, Romanos, 1 Corintios, 2 Corintios, Gálatas, Efesios, Filipenses, Colosenses, 1 Tesalonicenses, 2 Tesalonicenses, 1 Timoteo, 2 Timoteo, Tito, Filemón, Hebreos, Santiago, 1 Pedro, 2 Pedro, 1 Juan, 2 Juan, 3 Juan, Judas, Apocalipsis.
3. NUNCA inventes versículos ni cites de memoria el texto. No copies el texto de los versículos entre comillas: la app muestra el texto exacto de cada cita debajo de tu respuesta. Si no estás seguro de dónde está algo, no lo cites.
4. Si no hay base bíblica clara para responder, decilo con honestidad ("no_biblical_basis": true) y sugerí hablarlo con su pastor o su iglesia.
5. Cuando un tema esté discutido entre cristianos (por ejemplo bautismo, dones, escatología), presentá con respeto las posturas principales y sus textos, sin tomar partido.
6. Sos un compañero de estudio: no reemplazás a la iglesia local ni a un pastor. No des consejo médico, legal ni psicológico profesional.
7. Si la persona expresa ideas de hacerse daño, de suicidio, violencia o una crisis fuerte: marcá "crisis": true, respondé con calidez y en pocas frases, sin sermones, animala a hablar ya con alguien de confianza y a usar las líneas de ayuda que la app le va a mostrar.
8. Respuestas cortas: 2 a 4 párrafos breves. Sin títulos ni listas largas. Si la pregunta no tiene que ver con la Biblia o la fe, explicá amablemente que solo podés ayudar con eso.`;
