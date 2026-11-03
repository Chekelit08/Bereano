import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { PlusGate } from '@/components/plus-gate';
import { PressLink, Touchable } from '@/components/press-link';
import { T } from '@/components/text';
import { Fonts, Radius, Space, usePalette } from '@/constants/theme';
import { track } from '@/lib/analytics';
import { formatRef, getBook, getChapter } from '@/lib/bible';
import { success } from '@/lib/haptics';
import { FREE_MEMORY, LEVELS, isDue, maskedWords } from '@/lib/memoria';
import { parseVerseKey } from '@/lib/personal';
import { usePlus } from '@/lib/plus';
import { useSettings } from '@/lib/settings';

/** Memorizar versículos: se tapan palabras y se repasa cada tanto (repaso espaciado). */
export default function Memorizar() {
  const c = usePalette();
  const { memory, reviewMemory, removeMemory } = useSettings();
  const { isPlus } = usePlus();
  const [current, setCurrent] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const [shown, setShown] = useState<Set<number>>(new Set());

  const items = Object.entries(memory)
    .map(([k, m]) => ({ k, m, v: parseVerseKey(k)! }))
    .filter((x) => x.v && getChapter(x.v.book, x.v.chapter)?.[x.v.verse - 1])
    .sort((a, b) => Number(isDue(b.m)) - Number(isDue(a.m)) || a.m.due.localeCompare(b.m.due));
  const due = items.filter((x) => isDue(x.m));
  const active = items.find((x) => x.k === current) ?? null;

  if (active) {
    const book = getBook(active.v.book)!;
    const text = getChapter(active.v.book, active.v.chapter)![active.v.verse - 1];
    const words = text.split(' ');
    const seed = active.v.chapter * 1000 + active.v.verse;
    const hidden = maskedWords(text, level, seed);
    const finish = (knew: boolean) => {
      reviewMemory(active.k, knew);
      if (knew) success();
      track('memoria_repaso', { supo: knew });
      setCurrent(null);
      setShown(new Set());
      setLevel(0);
    };
    return (
      <ScrollView contentContainerStyle={styles.page}>
        <T variant="label">Memorizando</T>
        <T variant="title" style={{ marginTop: 2 }}>
          {formatRef(book, active.v.chapter, active.v.verse)}
        </T>
        <View style={styles.levels}>
          {LEVELS.map((l, i) => (
            <Touchable
              key={l}
              accessibilityRole="radio"
              accessibilityState={{ selected: level === i }}
              onPress={() => {
                setLevel(i);
                setShown(new Set());
              }}
              style={[styles.chip, { backgroundColor: level === i ? c.fill : c.surface }]}>
              <T style={{ fontFamily: Fonts.uiBold, fontSize: 13, color: level === i ? c.fillInk : c.text }}>
                {l === 1 ? 'Todo' : `${Math.round(l * 100)} %`}
              </T>
            </Touchable>
          ))}
        </View>
        <View style={[styles.card, { backgroundColor: c.surface }]}>
          <View style={styles.words}>
            {words.map((w, i) =>
              hidden[i] && !shown.has(i) ? (
                <Touchable
                  key={i}
                  accessibilityRole="button"
                  accessibilityLabel="Mostrar palabra"
                  onPress={() => setShown((s) => new Set(s).add(i))}
                  style={[styles.blank, { backgroundColor: c.surface2, width: Math.max(28, w.length * 11) }]}>
                  <T> </T>
                </Touchable>
              ) : (
                <T key={i} style={styles.word}>
                  {w}
                </T>
              ),
            )}
          </View>
          <T variant="muted" style={{ marginTop: Space.md, fontSize: 13 }}>
            Decilo en voz alta. Tocá un espacio para ver la palabra.
          </T>
        </View>
        <View style={styles.actions}>
          <Touchable
            accessibilityRole="button"
            onPress={() => finish(false)}
            style={({ pressed }) => [styles.action, { borderColor: c.text, opacity: pressed ? 0.7 : 1 }]}>
            <T style={{ fontFamily: Fonts.uiBold }}>Me costó</T>
          </Touchable>
          <Touchable
            accessibilityRole="button"
            onPress={() => finish(true)}
            style={({ pressed }) => [
              styles.action,
              { backgroundColor: c.fill, borderColor: c.fill, opacity: pressed ? 0.85 : 1 },
            ]}>
            <T style={{ fontFamily: Fonts.uiBold, color: c.fillInk }}>Lo sé</T>
          </Touchable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <T variant="title">
        Memorizar{' '}
        <T variant="title" style={{ color: c.muted }}>
          versículos
        </T>
      </T>
      <T variant="muted" style={{ marginTop: Space.sm, fontSize: 16 }}>
        “{getChapter('psa', 119)![10]}” Salmos 119:11
      </T>

      {items.length === 0 ? (
        <View style={[styles.card, { backgroundColor: c.surface }]}>
          <T style={{ fontFamily: Fonts.uiBold, fontSize: 16 }}>Empezá por uno</T>
          <T variant="muted" style={{ marginTop: 4 }}>
            En la Biblia, tocá un versículo y elegí “Memorizar”. Acá lo practicás tapando palabras y te
            avisamos cuándo repasarlo.
          </T>
          <PressLink
            href="/jhn/3?v=16"
            style={({ pressed }) => ({ marginTop: Space.md, opacity: pressed ? 0.6 : 1 })}>
            <T style={{ fontFamily: Fonts.uiBold, color: c.accent }}>Probar con Juan 3:16 →</T>
          </PressLink>
        </View>
      ) : (
        <>
          <T variant="heading" style={{ marginTop: Space.xl }}>
            {due.length ? `Para repasar hoy (${due.length})` : 'Todo repasado por hoy ✓'}
          </T>
          {items.map(({ k, m, v }) => {
            const book = getBook(v.book)!;
            const text = getChapter(v.book, v.chapter)![v.verse - 1];
            const today = isDue(m);
            return (
              <View key={k} style={[styles.row, { borderColor: c.line }]}>
                <Touchable
                  accessibilityRole="button"
                  onPress={() => setCurrent(k)}
                  style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.7 : 1 })}>
                  <T style={{ fontFamily: Fonts.uiBold, color: c.accent }}>
                    {formatRef(book, v.chapter, v.verse)}
                  </T>
                  <T
                    style={{ fontFamily: Fonts.read, fontSize: 16, lineHeight: 24, marginTop: 2 }}
                    numberOfLines={2}>
                    {text}
                  </T>
                  <T variant="muted" style={{ fontSize: 13, marginTop: 4 }}>
                    {today
                      ? 'Repasar hoy'
                      : `Próximo repaso: ${m.due.split('-').reverse().slice(0, 2).join('/')}`}
                    {m.streak ? ` · ${m.streak} ${m.streak === 1 ? 'acierto' : 'aciertos'} seguidos` : ''}
                  </T>
                </Touchable>
                <Touchable
                  accessibilityRole="button"
                  accessibilityLabel="Quitar"
                  hitSlop={10}
                  onPress={() => removeMemory(k)}>
                  <T style={{ color: c.muted, fontSize: 20 }}>×</T>
                </Touchable>
              </View>
            );
          })}
        </>
      )}

      {!isPlus && items.length >= FREE_MEMORY && (
        <View style={{ marginTop: Space.xl }}>
          <PlusGate
            title="Memorizá todos los que quieras"
            detail={`Sin Plus podés memorizar ${FREE_MEMORY} versículo. Con Bereano Plus, sin límite, con repaso espaciado.`}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: Space.lg, paddingBottom: Space.xxl, maxWidth: 720, width: '100%', alignSelf: 'center' },
  levels: { flexDirection: 'row', gap: Space.sm, marginTop: Space.lg },
  chip: { borderRadius: Radius.pill, paddingHorizontal: 14, paddingVertical: 8 },
  card: { marginTop: Space.lg, padding: Space.lg, borderRadius: Radius.md },
  words: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  word: { fontFamily: Fonts.read, fontSize: 22, lineHeight: 34 },
  blank: { height: 30, borderRadius: 6 },
  actions: { flexDirection: 'row', gap: Space.sm, marginTop: Space.lg },
  action: { flex: 1, borderWidth: 1, borderRadius: Radius.pill, paddingVertical: 14, alignItems: 'center' },
  row: {
    flexDirection: 'row',
    gap: Space.md,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
