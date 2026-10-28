// Edge Function: compañero de estudio bíblico con IA.
//
// Seguridad (ver CLAUDE.md):
// - La clave de Anthropic y la service_role viven solo acá, en variables de entorno.
// - Solo usuarios con sesión (aunque sea anónima). Límite de usos por usuario y por día.
// - Todo lo que entra se valida (core.ts). Las conversaciones no se guardan.
// - Ninguna cita llega a la app sin verificarse contra la base: el texto de cada versículo
//   sale de bible_verses, nunca de la IA.
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import {
  type Book,
  type Citation,
  cacheText,
  detectCrisis,
  findReferences,
  isCovered,
  quoteIsInVerses,
  quotedFragments,
  SYSTEM_PROMPT,
  validateRequest,
} from "./core.ts";

const MODEL = "claude-haiku-5-5";
const DAILY_LIMIT = Number(Deno.env.get("COMPANION_DAILY_LIMIT") ?? "20");
const VERSION = "rv1909";

const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });
const db = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  {
    auth: { persistSession: false },
  },
);

const Answer = z.object({
  answer: z
    .string()
    .describe(
      "La respuesta, en 2 a 4 párrafos breves. Sin copiar texto bíblico entre comillas.",
    ),
  citations: z
    .array(
      z.object({
        book: z
          .string()
          .describe("Nombre del libro, como en la lista del sistema"),
        chapter: z.number().int(),
        verse_start: z.number().int(),
        verse_end: z.number().int(),
      }),
    )
    .describe("Cada pasaje mencionado en la respuesta"),
  no_biblical_basis: z.boolean(),
  crisis: z.boolean(),
});
type Answer = z.infer<typeof Answer>;

type VerifiedCitation = Citation & {
  ref: string;
  book: string;
  code: string;
  text: string[];
};
export type CompanionResponse =
  | {
      type: "answer";
      answer: string;
      citations: VerifiedCitation[];
      noBiblicalBasis: boolean;
      remaining: number | null;
    }
  | { type: "crisis" }
  | { type: "limit" }
  | { type: "error"; message: string };

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: CompanionResponse, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

let booksCache: Book[] | null = null;
async function getBooks(): Promise<Book[]> {
  if (!booksCache) {
    const { data, error } = await db
      .from("bible_books")
      .select("id, code, name")
      .order("id");
    if (error || !data?.length) throw new Error("No pude leer los libros");
    booksCache = data as Book[];
  }
  return booksCache;
}

async function sha256(text: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Busca cada cita en la base. Las que no existen se descartan. */
async function verifyCitations(
  answer: Answer,
  books: Book[],
): Promise<VerifiedCitation[]> {
  const out: VerifiedCitation[] = [];
  for (const c of answer.citations.slice(0, 8)) {
    const [ref] = findReferences(
      `${c.book} ${c.chapter}:${c.verse_start}-${c.verse_end}`,
      books,
    );
    if (!ref || ref.from < 1 || ref.to < ref.from || ref.to - ref.from > 30)
      continue;
    const { data } = await db
      .from("bible_verses")
      .select("verse, text")
      .eq("version_id", VERSION)
      .eq("book_id", ref.bookId)
      .eq("chapter", ref.chapter)
      .gte("verse", ref.from)
      .lte("verse", ref.to)
      .order("verse");
    // Tienen que existir TODOS los versículos del rango.
    if (!data || data.length !== ref.to - ref.from + 1) continue;
    const book = books.find((b) => b.id === ref.bookId)!;
    out.push({
      ...ref,
      book: book.name,
      code: book.code.toLowerCase(),
      ref: `${book.name} ${ref.chapter}:${ref.from}${ref.to > ref.from ? `-${ref.to}` : ""}`,
      text: data.map((v) => v.text as string),
    });
  }
  return out;
}

/** Problemas que impiden mostrar la respuesta. Vacío = se puede mostrar. */
function problems(
  answer: Answer,
  verified: VerifiedCitation[],
  books: Book[],
): string[] {
  const issues: string[] = [];
  if (verified.length < answer.citations.length) {
    issues.push(
      'Alguna de las citas de "citations" no existe en la Reina-Valera 1909 con esa numeración.',
    );
  }
  for (const ref of findReferences(answer.answer, books)) {
    if (!isCovered(ref, verified)) {
      issues.push(
        'La respuesta menciona un pasaje que no está en "citations" o que no existe.',
      );
      break;
    }
  }
  const allVerses = verified.flatMap((v) => v.text);
  for (const q of quotedFragments(answer.answer)) {
    if (!quoteIsInVerses(q, allVerses)) {
      issues.push(
        "La respuesta copia entre comillas un texto que no coincide con los versículos citados. No copies texto bíblico.",
      );
      break;
    }
  }
  if (!answer.no_biblical_basis && verified.length === 0 && !answer.crisis) {
    issues.push("La respuesta no tiene ninguna cita verificable.");
  }
  return issues;
}

async function ask(messages: Anthropic.MessageParam[]): Promise<Answer | null> {
  const response = await anthropic.messages.parse({
    model: MODEL,
    max_tokens: 4000,
    output_config: { effort: "low", format: zodOutputFormat(Answer) },
    // El prompt de sistema no cambia nunca: queda en caché y cada pregunta cuesta menos.
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages,
  });
  if (response.stop_reason !== "end_turn") return null; // refusal, max_tokens, etc.
  return response.parsed_output ?? null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST")
    return json({ type: "error", message: "Método no permitido" }, 405);

  // 1. Sesión obligatoria.
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return json({ type: "error", message: "Sin sesión" }, 401);
  const { data: auth, error: authError } = await db.auth.getUser(token);
  if (authError || !auth.user)
    return json({ type: "error", message: "Sesión inválida" }, 401);
  const userId = auth.user.id;

  // 2. Validar la entrada.
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ type: "error", message: "Pedido inválido" }, 400);
  }
  const input = validateRequest(body);
  if ("error" in input)
    return json({ type: "error", message: input.error }, 400);

  // 3. Crisis: respuesta inmediata, sin IA y sin gastar usos.
  if (detectCrisis(input.question)) return json({ type: "crisis" });

  // 4. Caché (solo primeras preguntas: con historial la respuesta depende de la charla).
  const cacheKey =
    input.history.length === 0
      ? await sha256(`${MODEL}|${cacheText(input.question)}`)
      : null;
  if (cacheKey) {
    const { data: hit } = await db
      .from("companion_cache")
      .select("response, hits")
      .eq("key", cacheKey)
      .maybeSingle();
    if (hit) {
      await db
        .from("companion_cache")
        .update({ hits: (hit.hits as number) + 1 })
        .eq("key", cacheKey);
      return json({
        ...(hit.response as CompanionResponse & { type: "answer" }),
        remaining: null,
      });
    }
  }

  // 5. Límite diario.
  const { data: remaining, error: quotaError } = await db.rpc(
    "companion_consume",
    {
      p_user: userId,
      p_limit: DAILY_LIMIT,
    },
  );
  if (quotaError)
    return json(
      { type: "error", message: "No pude revisar tu límite diario" },
      500,
    );
  if (remaining === -1) return json({ type: "limit" }, 429);

  try {
    const books = await getBooks();
    const messages: Anthropic.MessageParam[] = [
      ...input.history.map((t) => ({ role: t.role, content: t.content })),
      { role: "user", content: input.question },
    ];

    // 6. Preguntar y verificar. Si algo no cierra, un segundo intento explicando qué corregir.
    let answer = await ask(messages);
    let verified = answer ? await verifyCitations(answer, books) : [];
    let issues = answer ? problems(answer, verified, books) : ["sin respuesta"];
    if (answer && issues.length) {
      answer = await ask([
        ...messages,
        { role: "assistant", content: JSON.stringify(answer) },
        {
          role: "user",
          content: `Tu respuesta no se puede mostrar porque: ${issues.join(" ")} Corregila. Si no estás seguro de una cita, sacala.`,
        },
      ]);
      verified = answer ? await verifyCitations(answer, books) : [];
      issues = answer ? problems(answer, verified, books) : ["sin respuesta"];
    }

    if (answer?.crisis) return json({ type: "crisis" });

    if (!answer || issues.length) {
      await db.rpc("companion_refund", { p_user: userId });
      return json({
        type: "answer",
        answer:
          "No pude armar una respuesta con citas bíblicas verificadas para esta pregunta. Probá formularla de otra manera, o buscá el tema en la Biblia con el buscador. También es una buena pregunta para charlar con tu pastor o tu grupo.",
        citations: [],
        noBiblicalBasis: true,
        remaining: remaining + 1,
      });
    }

    const result: CompanionResponse = {
      type: "answer",
      answer: answer.answer,
      citations: verified,
      noBiblicalBasis: answer.no_biblical_basis,
      remaining,
    };
    if (cacheKey)
      await db
        .from("companion_cache")
        .upsert({ key: cacheKey, response: result });
    return json(result);
  } catch (e) {
    await db.rpc("companion_refund", { p_user: userId });
    // Sin el texto de la pregunta: las conversaciones son privadas.
    console.error(
      "companero:",
      e instanceof Anthropic.APIError ? `${e.status} ${e.name}` : String(e),
    );
    const busy =
      e instanceof Anthropic.RateLimitError ||
      (e instanceof Anthropic.APIError && (e.status ?? 0) >= 500);
    return json(
      {
        type: "error",
        message: busy
          ? "El compañero está ocupado. Probá en un rato."
          : "Algo salió mal.",
      },
      502,
    );
  }
});
