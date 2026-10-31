import { StyleSheet, View } from 'react-native';

import { EmailCapture } from '@/components/email-capture';
import { PressLink, Touchable } from '@/components/press-link';
import { ShareCardButton } from '@/components/share-card-button';
import { T } from '@/components/text';
import { Fonts, Space, usePalette } from '@/constants/theme';
import { shareRange, shareText, type Devocional } from '@/data/devocionales';
import { designsForDay } from '@/data/disenos';
import { MARKS } from '@/data/marcas';
import { track } from '@/lib/analytics';
import { formatRef, getBook, getChapter } from '@/lib/bible';
import { dayKey } from '@/lib/dias';
import { success } from '@/lib/haptics';
import { useSettings } from '@/lib/settings';

export function DevocionalView({ devocional: d, kicker }: { devocional: Devocional; kicker: string }) {
  const c = usePalette();
  const { saved, toggleSaved, fontSize, days, markDay, emailJoined } = useSettings();
  const read = !!days[dayKey()]?.devo;

  // El pasaje sale siempre de la Biblia de la app: nunca se escribe a mano.
  const book = getBook(d.book)!;
  const chapter = getChapter(d.book, d.chapter)!;
  const verses = chapter.slice(d.from - 1, d.to).map((text, i) => ({ n: d.from + i, text }));
  const [sa, sb] = shareRange(d);
  const cardText = shareText(chapter.slice(sa - 1, sb));
  const shareRef = formatRef(book, d.chapter, sa, sb);
  const isSaved = saved.includes(d.id);

  const body = {
    fontFamily: Fonts.read,
    fontSize: fontSize - 1,
    lineHeight: Math.round((fontSize - 1) * 1.75),
  };

  return (
    <View>
      <T variant="label">{kicker}</T>
      <T variant="title" style={{ marginTop: Space.sm }}>
        {d.title}
      </T>

      <View style={[styles.passage, { backgroundColor: c.surface }]}>
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

      <Touchable
        accessibilityRole="button"
        accessibilityState={{ checked: read }}
        onPress={() => {
          if (!read) success();
          if (!read) track('devocional_leido', { id: d.id });
          markDay('devo');
        }}
        style={({ pressed }) => [
          styles.done,
          { backgroundColor: read ? c.surface2 : c.fill, opacity: pressed ? 0.85 : 1 },
        ]}>
        <T style={[styles.buttonText, { color: read ? c.text : c.fillInk }]}>
          {read ? 'Leído hoy ✓' : 'Marcar como leído'}
        </T>
      </Touchable>

      {read && !emailJoined && (
        <View style={{ marginTop: Space.md }}>
          <EmailCapture origen="devocional" />
        </View>
      )}

      <View style={styles.actions}>
        <Touchable
          onPress={() => {
            if (!isSaved) track('devocional_guardado', { id: d.id });
            toggleSaved(d.id);
          }}
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
        <View style={{ flex: 1 }}>
          <ShareCardButton
            variant="outline"
            label="Compartir imagen"
            design={designsForDay()[0]}
            text={cardText}
            reference={shareRef}
            marks={MARKS[d.id]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  passage: {
    marginTop: Space.lg,
    padding: Space.lg,
    borderRadius: 18,
  },
  ref: { fontFamily: Fonts.displayItalic, fontSize: 22, marginBottom: Space.sm },
  verse: { marginTop: 6 },
  verseNum: { fontFamily: Fonts.ui, fontSize: 12 },
  question: { marginTop: Space.xl, paddingLeft: Space.md, borderLeftWidth: 2 },
  questionText: { fontFamily: Fonts.displayItalic, fontSize: 28, lineHeight: 34, marginTop: Space.sm },
  done: { marginTop: Space.xl, borderRadius: 999, paddingVertical: 16, alignItems: 'center' },
  actions: { flexDirection: 'row', gap: Space.sm, marginTop: Space.sm },
  button: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { fontFamily: Fonts.uiBold, fontSize: 16 },
});
