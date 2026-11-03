import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { NotFound } from '@/components/not-found';
import { PlusGate } from '@/components/plus-gate';
import { Touchable } from '@/components/press-link';
import { T } from '@/components/text';
import { Fonts, Radius, Space, usePalette } from '@/constants/theme';
import { cleanVerse, getGuide } from '@/data/oracion-guiada';
import { track } from '@/lib/analytics';
import { formatRef, getBook, getChapter } from '@/lib/bible';
import { success } from '@/lib/haptics';
import { usePlus } from '@/lib/plus';
import { useSettings } from '@/lib/settings';

/** Una guía de oración, paso a paso, con un temporizador suave para cada paso. */
export default function Guia() {
  const c = usePalette();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const guide = getGuide(id);
  const { isPlus } = usePlus();
  const { prayers } = useSettings();
  const [step, setStep] = useState(0);
  const [left, setLeft] = useState(guide?.steps[0]?.seconds ?? 0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!guide || done) return;
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [guide, done, step]);

  if (!guide) return <NotFound />;
  if (guide.premium && !isPlus)
    return (
      <View style={styles.page}>
        <PlusGate
          title={guide.title}
          detail="Esta oración guiada es parte de Bereano Plus. La primera guía es gratis."
        />
      </View>
    );

  const s = guide.steps[step];
  const verse = s.ref ? getChapter(s.ref.book, s.ref.chapter)?.[s.ref.verse - 1] : undefined;
  const open = prayers.filter((p) => !p.answered);
  const progress = (s.seconds - left) / s.seconds;

  const next = () => {
    if (step + 1 < guide.steps.length) {
      setStep(step + 1);
      setLeft(guide.steps[step + 1].seconds);
    } else {
      success();
      track('oracion_guiada_completa', { guia: guide.id });
      setDone(true);
    }
  };

  if (done)
    return (
      <View style={[styles.page, styles.center]}>
        <T style={{ fontSize: 48 }}>🙏</T>
        <T variant="title" style={{ textAlign: 'center', marginTop: Space.md }}>
          Amén
        </T>
        <T variant="muted" style={{ textAlign: 'center', marginTop: Space.sm, fontSize: 16 }}>
          Terminaste “{guide.title}”. Volvé cuando quieras.
        </T>
        <Touchable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.primary, { backgroundColor: c.fill, opacity: pressed ? 0.85 : 1 }]}>
          <T style={{ color: c.fillInk, fontFamily: Fonts.uiBold }}>Volver</T>
        </Touchable>
      </View>
    );

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.dots}>
        {guide.steps.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i <= step ? c.fill : c.surface2, flex: i === step ? 2 : 1 },
            ]}
          />
        ))}
      </View>
      <T variant="label" style={{ marginTop: Space.lg }}>
        Paso {step + 1} de {guide.steps.length}
      </T>
      <T variant="title" style={{ marginTop: 2 }}>
        {s.title}
      </T>
      <T style={{ fontSize: 18, lineHeight: 27, marginTop: Space.md }}>{s.prompt}</T>

      {verse && s.ref && (
        <View style={[styles.verse, { backgroundColor: c.surface }]}>
          <T style={{ fontFamily: Fonts.read, fontSize: 20, lineHeight: 32 }}>“{cleanVerse(verse)}”</T>
          <T style={{ fontFamily: Fonts.uiBold, color: c.accent, marginTop: Space.sm }}>
            {formatRef(getBook(s.ref.book)!, s.ref.chapter, s.ref.verse)}
          </T>
        </View>
      )}

      {s.usePrayers && open.length > 0 && (
        <View style={{ marginTop: Space.md, gap: 6 }}>
          {open.slice(0, 8).map((p) => (
            <T key={p.id} style={{ fontSize: 16 }}>
              • {p.text}
            </T>
          ))}
        </View>
      )}

      <View style={[styles.timer, { backgroundColor: c.surface2 }]}>
        <View style={[styles.timerFill, { backgroundColor: c.fill, width: `${progress * 100}%` }]} />
      </View>
      <T variant="muted" style={{ textAlign: 'center', marginTop: 6 }}>
        {left > 0
          ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')} en silencio`
          : 'Cuando quieras, seguí'}
      </T>

      <Touchable
        accessibilityRole="button"
        onPress={next}
        style={({ pressed }) => [styles.primary, { backgroundColor: c.fill, opacity: pressed ? 0.85 : 1 }]}>
        <T style={{ color: c.fillInk, fontFamily: Fonts.uiBold }}>
          {step + 1 < guide.steps.length ? 'Siguiente paso' : 'Terminar'}
        </T>
      </Touchable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: Space.lg, paddingBottom: Space.xxl, maxWidth: 640, width: '100%', alignSelf: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { height: 4, borderRadius: 2 },
  verse: { marginTop: Space.lg, padding: Space.lg, borderRadius: Radius.md },
  timer: { height: 6, borderRadius: 3, overflow: 'hidden', marginTop: Space.xl },
  timerFill: { height: 6, borderRadius: 3 },
  primary: {
    marginTop: Space.lg,
    borderRadius: Radius.pill,
    paddingVertical: 15,
    paddingHorizontal: Space.xl,
    alignItems: 'center',
  },
});
