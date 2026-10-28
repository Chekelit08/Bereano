import * as Sharing from 'expo-sharing';
import { useRef, useState } from 'react';
import { Platform, Share, StyleSheet, View, type ViewInstance } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { PressLink, Touchable } from '@/components/press-link';
import { CARD_HEIGHT, CARD_WIDTH, ShareCard } from '@/components/share-card';
import { T } from '@/components/text';
import { Fonts, Space, usePalette } from '@/constants/theme';
import { shareRange, shareText, type Devocional } from '@/data/devocionales';
import { formatRef, getBook, getChapter } from '@/lib/bible';
import { useSettings } from '@/lib/settings';

export function DevocionalView({ devocional: d, kicker }: { devocional: Devocional; kicker: string }) {
  const c = usePalette();
  const { saved, toggleSaved, fontSize } = useSettings();
  const card = useRef<ViewInstance>(null);
  const [sharing, setSharing] = useState(false);

  // El pasaje sale siempre de la Biblia de la app: nunca se escribe a mano.
  const book = getBook(d.book)!;
  const chapter = getChapter(d.book, d.chapter)!;
  const verses = chapter.slice(d.from - 1, d.to).map((text, i) => ({ n: d.from + i, text }));
  const [sa, sb] = shareRange(d);
  const cardText = shareText(chapter.slice(sa - 1, sb));
  const shareRef = formatRef(book, d.chapter, sa, sb);
  const isSaved = saved.includes(d.id);

  async function share() {
    setSharing(true);
    try {
      if (Platform.OS !== 'web' && (await Sharing.isAvailableAsync())) {
        const uri = await captureRef(card, {
          format: 'png',
          quality: 1,
          width: CARD_WIDTH * 3,
          height: CARD_HEIGHT * 3,
          result: 'tmpfile',
        });
        await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png', dialogTitle: d.title });
      } else {
        await Share.share({ message: `“${cardText}”\n— ${shareRef} (RV1909)\n\nBereano` });
      }
    } catch {
      // El usuario canceló o el sistema no pudo compartir: no hay nada que hacer.
    } finally {
      setSharing(false);
    }
  }

  const body = { fontSize: fontSize - 1, lineHeight: Math.round((fontSize - 1) * 1.7) };

  return (
    <View>
      <T variant="label">{kicker}</T>
      <T variant="title" style={{ marginTop: Space.sm }}>
        {d.title}
      </T>

      <View style={[styles.passage, { backgroundColor: c.surface, borderColor: c.line }]}>
        <T style={[styles.ref, { color: c.accent }]}>{formatRef(book, d.chapter, d.from, d.to)}</T>
        {verses.map((v) => (
          <T key={v.n} style={[body, styles.verse]}>
            <T style={[styles.verseNum, { color: c.muted }]}>{v.n} </T>
            {v.text}
          </T>
        ))}
        <PressLink
          href={{ pathname: '/[book]/[chapter]', params: { book: d.book, chapter: d.chapter, v: d.from } }}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, marginTop: Space.sm })}>
          <T variant="label" style={{ color: c.accent }}>
            Leer {book.name} {d.chapter} completo →
          </T>
        </PressLink>
      </View>

      {d.reflection.split('\n\n').map((p, i) => (
        <T key={i} style={[body, { marginTop: Space.md }]}>
          {p}
        </T>
      ))}

      <View style={[styles.question, { borderColor: c.accent }]}>
        <T variant="label" style={{ color: c.accent }}>
          Para aplicar hoy
        </T>
        <T style={styles.questionText}>{d.question}</T>
      </View>

      <View style={styles.actions}>
        <Touchable
          onPress={() => toggleSaved(d.id)}
          accessibilityRole="button"
          accessibilityState={{ selected: isSaved }}
          style={({ pressed }) => [
            styles.button,
            {
              borderColor: c.text,
              backgroundColor: isSaved ? c.text : 'transparent',
              opacity: pressed ? 0.7 : 1,
            },
          ]}>
          <T style={[styles.buttonText, { color: isSaved ? c.bg : c.text }]}>
            {isSaved ? 'Guardado ✓' : 'Guardar'}
          </T>
        </Touchable>
        <Touchable
          onPress={share}
          disabled={sharing}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.button,
            { borderColor: c.accent, backgroundColor: c.accent, opacity: pressed || sharing ? 0.7 : 1 },
          ]}>
          <T style={[styles.buttonText, { color: c.accentInk }]}>Compartir imagen</T>
        </Touchable>
      </View>

      {/* Fuera de pantalla: solo existe para sacarle la foto. */}
      <View style={styles.offscreen} pointerEvents="none" aria-hidden>
        <ShareCard ref={card} text={cardText} reference={shareRef} title={d.title} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  passage: {
    marginTop: Space.lg,
    padding: Space.lg,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },
  ref: { fontFamily: Fonts.displayItalic, fontSize: 17, marginBottom: Space.sm },
  verse: { marginTop: 6 },
  verseNum: { fontFamily: Fonts.body, fontSize: 12 },
  question: { marginTop: Space.xl, paddingLeft: Space.md, borderLeftWidth: 2 },
  questionText: { fontFamily: Fonts.displayItalic, fontSize: 22, lineHeight: 30, marginTop: Space.sm },
  actions: { flexDirection: 'row', gap: Space.sm, marginTop: Space.xl },
  button: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { fontFamily: Fonts.displayMedium, fontSize: 16 },
  offscreen: { position: 'absolute', left: -CARD_WIDTH * 3, top: 0 },
});
