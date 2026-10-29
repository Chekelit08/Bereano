import AsyncStorage from '@react-native-async-storage/async-storage';
import { FunctionsHttpError } from '@supabase/supabase-js';

import { ensureSession, supabase } from '@/lib/supabase';

export type CompanionCitation = {
  ref: string;
  code: string;
  chapter: number;
  from: number;
  to: number;
  text: string[];
};

export type ChatMessage =
  | { id: string; role: 'user'; text: string }
  | {
      id: string;
      role: 'assistant';
      text: string;
      citations: CompanionCitation[];
      noBiblicalBasis?: boolean;
    };

export type AskResult =
  | { type: 'answer'; message: ChatMessage; remaining: number | null; plan: 'plus' | 'free' | null }
  | { type: 'crisis' }
  | { type: 'limit'; reason: 'daily' | 'free' }
  | { type: 'error'; message: string };

const KEY = 'bereano.chat.v1';

let seq = 0;
export function newId(): string {
  seq += 1;
  return `${Date.now().toString(36)}-${seq}`;
}
const MAX_SAVED = 60;

/** La conversación queda solo en este teléfono. */
export async function loadChat(): Promise<ChatMessage[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const v = raw ? JSON.parse(raw) : [];
    return Array.isArray(v)
      ? v.filter((m) => m && typeof m.text === 'string' && (m.role === 'user' || m.role === 'assistant'))
      : [];
  } catch {
    return [];
  }
}

export async function saveChat(messages: ChatMessage[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(messages.slice(-MAX_SAVED))).catch(() => {});
}

export async function clearChat() {
  await AsyncStorage.removeItem(KEY).catch(() => {});
}

function country(): string | undefined {
  const region = Intl.DateTimeFormat().resolvedOptions().locale.split('-')[1];
  return region && /^[A-Z]{2}$/.test(region) ? region : undefined;
}

export async function ask(question: string, previous: ChatMessage[]): Promise<AskResult> {
  try {
    await ensureSession();
  } catch {
    return { type: 'error', message: 'No pude conectarme. Revisá tu conexión.' };
  }
  // Los últimos 3 intercambios completos, para que entienda "¿y eso qué significa?".
  const history = previous.slice(-6).map((m) => ({ role: m.role, content: m.text }));
  while (history.length && history[0].role !== 'user') history.shift();
  if (history.length % 2) history.pop();

  const { data, error } = await supabase.functions.invoke('companero', {
    body: { question, history, country: country() },
  });
  let res = data;
  if (error instanceof FunctionsHttpError) {
    res = await error.context.json().catch(() => null);
  } else if (error) {
    return { type: 'error', message: 'No pude conectarme. Revisá tu conexión.' };
  }
  if (!res || typeof res !== 'object') return { type: 'error', message: 'Algo salió mal.' };
  if (res.type === 'crisis') return { type: 'crisis' };
  if (res.type === 'limit') return { type: 'limit', reason: res.reason === 'free' ? 'free' : 'daily' };
  if (res.type === 'answer') {
    return {
      type: 'answer',
      remaining: typeof res.remaining === 'number' ? res.remaining : null,
      plan: res.plan === 'plus' || res.plan === 'free' ? res.plan : null,
      message: {
        id: newId(),
        role: 'assistant',
        text: String(res.answer),
        noBiblicalBasis: !!res.noBiblicalBasis,
        citations: Array.isArray(res.citations) ? res.citations : [],
      },
    };
  }
  return { type: 'error', message: typeof res.message === 'string' ? res.message : 'Algo salió mal.' };
}
