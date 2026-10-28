import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
  type FlatListInstance,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressLink, Touchable } from '@/components/press-link';
import { T } from '@/components/text';
import { Fonts, Space, usePalette } from '@/constants/theme';
import { ask, clearChat, loadChat, newId, saveChat, type ChatMessage } from '@/lib/companero';

const MAX = 500;
const SUGGESTIONS = [
  '¿Qué significa que somos salvos por gracia?',
  '¿Cómo puedo orar cuando estoy ansioso?',
  '¿Quiénes eran los bereanos?',
  '¿Qué dice la Biblia sobre el perdón?',
];

export default function Companero() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const list = useRef<FlatListInstance>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    loadChat().then(setMessages);
  }, []);

  async function send(text: string) {
    const question = text.replace(/\s+/g, ' ').trim().slice(0, MAX);
    if (question.length < 2 || busy) return;
    const previous = messages;
    const withQuestion: ChatMessage[] = [...previous, { id: newId(), role: 'user', text: question }];
    setMessages(withQuestion);
    setInput('');
    setNotice(null);
    setBusy(true);
    const res = await ask(question, previous);
    setBusy(false);
    if (res.type === 'answer') {
      const next = [...withQuestion, res.message];
      setMessages(next);
      saveChat(next);
      if (res.remaining !== null) setRemaining(res.remaining);
    } else {
      // La pregunta no se guarda si no hubo respuesta.
      setMessages(previous);
      if (res.type !== 'crisis') setInput(question);
      if (res.type === 'crisis') router.push('/ayuda');
      else if (res.type === 'limit')
        setNotice('Llegaste al límite de preguntas de hoy. Mañana podés seguir.');
      else setNotice(res.message);
    }
  }

  const empty = messages.length === 0;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + Space.md, borderColor: c.line }]}>
        <View>
          <T variant="label">Compañero de estudio</T>
          <T style={{ fontFamily: Fonts.display, fontSize: 26, marginTop: 2 }}>
            Preguntá{' '}
            <T style={{ fontFamily: Fonts.displayItalic, fontSize: 26, color: c.accent }}>con la Biblia</T>
          </T>
        </View>
        {!empty && (
          <Touchable
            accessibilityRole="button"
            onPress={() => {
              setMessages([]);
              clearChat();
            }}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 6 })}>
            <T variant="label" style={{ color: c.accent }}>
              Borrar
            </T>
          </Touchable>
        )}
      </View>

      <FlatList
        ref={list}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => list.current?.scrollToEnd({ animated: true })}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View>
            <T variant="muted">
              Hacé una pregunta sobre un pasaje o un tema. Cada respuesta trae sus citas, verificadas en la
              Reina-Valera 1909. No reemplaza a tu iglesia ni a tu pastor.
            </T>
            <View style={styles.suggestions}>
              {SUGGESTIONS.map((s) => (
                <Touchable
                  key={s}
                  onPress={() => send(s)}
                  style={({ pressed }) => [
                    styles.chip,
                    { borderColor: c.line, backgroundColor: pressed ? c.surface : 'transparent' },
                  ]}>
                  <T style={{ fontSize: 15, lineHeight: 21 }}>{s}</T>
                </Touchable>
              ))}
            </View>
          </View>
        }
        renderItem={({ item }: { item: ChatMessage }) =>
          item.role === 'user' ? (
            <View style={[styles.user, { backgroundColor: c.text }]}>
              <T style={{ color: c.bg, fontSize: 16, lineHeight: 23 }}>{item.text}</T>
            </View>
          ) : (
            <View style={styles.assistant}>
              {item.text.split(/\n{2,}/).map((p, i) => (
                <T key={i} style={{ fontSize: 17, lineHeight: 28, marginTop: i ? Space.sm : 0 }}>
                  {p}
                </T>
              ))}
              {item.citations.map((cit) => (
                <PressLink
                  key={cit.ref}
                  href={{
                    pathname: '/[book]/[chapter]',
                    params: { book: cit.code, chapter: cit.chapter, v: cit.from },
                  }}
                  style={({ pressed }) => [
                    styles.citation,
                    { backgroundColor: c.surface, borderColor: c.line, opacity: pressed ? 0.7 : 1 },
                  ]}>
                  <T style={{ fontFamily: Fonts.displayItalic, color: c.accent, fontSize: 16 }}>{cit.ref}</T>
                  <T style={{ fontSize: 15, lineHeight: 23, marginTop: 4 }} numberOfLines={6}>
                    {cit.text.join(' ')}
                  </T>
                </PressLink>
              ))}
            </View>
          )
        }
        ListFooterComponent={
          busy ? (
            <View style={styles.thinking}>
              <ActivityIndicator color={c.accent} />
              <T variant="muted">Buscando en las Escrituras…</T>
            </View>
          ) : undefined
        }
      />

      {notice && (
        <T variant="muted" style={styles.notice}>
          {notice}
        </T>
      )}
      <View style={[styles.composer, { borderColor: c.line, backgroundColor: c.bg }]}>
        <TextInput
          value={input}
          onChangeText={(t) => setInput(t.slice(0, MAX))}
          placeholder="Escribí tu pregunta…"
          placeholderTextColor={c.muted}
          multiline
          accessibilityLabel="Pregunta para el compañero"
          style={[styles.input, { color: c.text, borderColor: c.line, backgroundColor: c.surface }]}
        />
        <Touchable
          accessibilityRole="button"
          accessibilityLabel="Enviar"
          disabled={busy || input.trim().length < 2}
          onPress={() => send(input)}
          style={({ pressed }) => [
            styles.send,
            { backgroundColor: c.accent, opacity: busy || input.trim().length < 2 ? 0.4 : pressed ? 0.8 : 1 },
          ]}>
          <T style={{ color: c.accentInk, fontSize: 20 }}>↑</T>
        </Touchable>
      </View>
      {remaining !== null && remaining <= 5 && (
        <T variant="muted" style={[styles.notice, { fontSize: 12 }]}>
          Te quedan {remaining} {remaining === 1 ? 'pregunta' : 'preguntas'} hoy
        </T>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Space.lg,
    paddingBottom: Space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  list: { padding: Space.lg, gap: Space.lg, maxWidth: 720, width: '100%', alignSelf: 'center' },
  suggestions: { marginTop: Space.lg, gap: Space.sm },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingHorizontal: Space.md,
    paddingVertical: 12,
  },
  user: { alignSelf: 'flex-end', maxWidth: '85%', borderRadius: 18, borderBottomRightRadius: 4, padding: 14 },
  assistant: { alignSelf: 'stretch' },
  citation: {
    marginTop: Space.sm,
    padding: Space.md,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  thinking: { flexDirection: 'row', gap: Space.sm, alignItems: 'center', paddingHorizontal: Space.lg },
  notice: { paddingHorizontal: Space.lg, paddingBottom: Space.xs, textAlign: 'center' },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Space.sm,
    paddingHorizontal: Space.md,
    paddingVertical: Space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 16,
    maxHeight: 120,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 20,
    paddingHorizontal: Space.md,
    paddingTop: 10,
    paddingBottom: 10,
  },
  send: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
});
