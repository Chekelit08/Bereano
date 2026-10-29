import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconBook, IconChat, IconSun } from '@/components/icons';
import { Touchable } from '@/components/press-link';
import { T } from '@/components/text';
import { Fonts, Radius, Space, usePalette } from '@/constants/theme';
import { devocionalDelDia, shareRange, shareText } from '@/data/devocionales';
import { GOALS, GOAL_INFO, NAME_MAX, recommendation, type Goal } from '@/data/onboarding';
import { getPlan } from '@/data/planes';
import { formatRef, getBook, getChapter } from '@/lib/bible';
import { tap } from '@/lib/haptics';
import { useSettings } from '@/lib/settings';

const STEPS = 4;

/** Bienvenida: en un minuto lleva a la primera experiencia (devocional y una pregunta al compañero). */
export default function Bienvenida() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { finishOnboarding } = useSettings();
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [name, setName] = useState('');

  const today = devocionalDelDia(new Date());
  const rec = recommendation(goals);
  const plan = getPlan(rec.plan)!;

  /** Termina la bienvenida y abre la primera experiencia sobre la pantalla de Hoy. */
  function finish(to?: Href) {
    finishOnboarding({ name, goals });
    router.replace('/');
    if (to) router.push(to);
  }

  const next = () => setStep((s) => Math.min(STEPS - 1, s + 1));

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.top, { paddingTop: insets.top + Space.md }]}>
        <View style={styles.dots}>
          {Array.from({ length: STEPS }, (_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i <= step ? c.fill : c.surface2, flex: i === step ? 2 : 1 },
              ]}
            />
          ))}
        </View>
        {step > 0 && (
          <Touchable
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => setStep((s) => s - 1)}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
            <T style={{ color: c.accent, fontFamily: Fonts.uiBold }}>Atrás</T>
          </Touchable>
        )}
      </View>

      <ScrollView
        contentContainerStyle={[styles.page, { paddingBottom: insets.bottom + Space.xl }]}
        keyboardShouldPersistTaps="handled">
        <Animated.View key={step} entering={FadeInDown.duration(450)} style={{ flex: 1 }}>
          {step === 0 && (
            <View style={styles.fill}>
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <T variant="label">Te damos la bienvenida a</T>
                <T style={[styles.hero, { color: c.text }]}>Bereano</T>
                <T style={[styles.lead, { color: c.muted }]}>
                  Un compañero para leer la Biblia, entenderla y volver a ella cada día.
                </T>
                <View style={{ marginTop: Space.xl, gap: Space.md }}>
                  <Feature
                    Icon={IconSun}
                    title="Un momento por día"
                    detail="Un pasaje, una reflexión corta y una pregunta."
                  />
                  <Feature
                    Icon={IconChat}
                    title="Preguntá lo que quieras"
                    detail="Respuestas con citas de la Biblia, verificadas."
                  />
                  <Feature
                    Icon={IconBook}
                    title="La Biblia, gratis siempre"
                    detail="Reina-Valera 1909, sin conexión."
                  />
                </View>
              </View>
              <Primary label="Empezar" onPress={next} />
            </View>
          )}

          {step === 1 && (
            <View style={styles.fill}>
              <View style={{ flex: 1 }}>
                <T variant="title">
                  ¿Qué te trae{' '}
                  <T variant="title" style={{ color: c.muted }}>
                    a Bereano?
                  </T>
                </T>
                <T variant="muted" style={[styles.sub]}>
                  Elegí lo que quieras. Con esto te recomendamos por dónde empezar.
                </T>
                <View style={styles.chips}>
                  {GOALS.map((g) => {
                    const on = goals.includes(g);
                    return (
                      <Touchable
                        key={g}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: on }}
                        onPress={() => {
                          tap();
                          setGoals((gs) => (on ? gs.filter((x) => x !== g) : [...gs, g]));
                        }}
                        style={({ pressed }) => [
                          styles.chip,
                          {
                            backgroundColor: on ? c.fill : c.surface,
                            opacity: pressed ? 0.8 : 1,
                          },
                        ]}>
                        {on && <T style={{ color: c.fillInk, fontFamily: Fonts.uiBold, fontSize: 16 }}>✓</T>}
                        <T style={{ fontFamily: Fonts.uiBold, fontSize: 16, color: on ? c.fillInk : c.text }}>
                          {GOAL_INFO[g].label}
                        </T>
                      </Touchable>
                    );
                  })}
                </View>
              </View>
              <Primary label={goals.length ? 'Seguir' : 'Saltar'} onPress={next} />
            </View>
          )}

          {step === 2 && (
            <View style={styles.fill}>
              <View style={{ flex: 1 }}>
                <T variant="title">
                  ¿Cómo te{' '}
                  <T variant="title" style={{ color: c.muted }}>
                    llamamos?
                  </T>
                </T>
                <T variant="muted" style={styles.sub}>
                  Para saludarte. Queda solo en tu teléfono.
                </T>
                <TextInput
                  value={name}
                  onChangeText={(t) => setName(t.slice(0, NAME_MAX))}
                  placeholder="Tu nombre"
                  placeholderTextColor={c.muted}
                  autoComplete="given-name"
                  textContentType="givenName"
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={next}
                  accessibilityLabel="Tu nombre"
                  style={[styles.input, { color: c.text, backgroundColor: c.surface }]}
                />
              </View>
              <Primary label={name.trim() ? 'Seguir' : 'Prefiero no decirlo'} onPress={next} />
            </View>
          )}

          {step === 3 && (
            <FirstMoment
              name={name.trim()}
              planTitle={plan.title}
              question={rec.question}
              devocional={today}
              onDevocional={() => finish({ pathname: '/devocional/[id]', params: { id: today.id } })}
              onAsk={() => finish({ pathname: '/companero', params: { q: rec.question } })}
              onPlan={() => finish({ pathname: '/planes/[id]', params: { id: plan.id } })}
            />
          )}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function FirstMoment({
  name,
  planTitle,
  question,
  devocional: d,
  onDevocional,
  onAsk,
  onPlan,
}: {
  name: string;
  planTitle: string;
  question: string;
  devocional: ReturnType<typeof devocionalDelDia>;
  onDevocional: () => void;
  onAsk: () => void;
  onPlan: () => void;
}) {
  const c = usePalette();
  const [a, b] = shareRange(d);
  const verse = shareText(getChapter(d.book, d.chapter)!.slice(a - 1, b));
  const ref = formatRef(getBook(d.book)!, d.chapter, a, b);
  return (
    <View style={styles.fill}>
      <View style={{ flex: 1 }}>
        <T variant="title">
          {name ? `${name}, este es` : 'Este es'}{' '}
          <T variant="title" style={{ color: c.muted }}>
            tu primer momento
          </T>
        </T>

        <View style={[styles.verse, { backgroundColor: c.surface }]}>
          <T variant="label">Versículo de hoy</T>
          <T style={styles.verseText}>“{verse}”</T>
          <T style={{ fontFamily: Fonts.uiBold, color: c.accent, marginTop: Space.sm }}>{ref}</T>
        </View>

        <T variant="label" style={{ marginTop: Space.lg }}>
          Preguntale al compañero
        </T>
        <Touchable
          accessibilityRole="button"
          onPress={onAsk}
          style={({ pressed }) => [styles.ask, { borderColor: c.line, opacity: pressed ? 0.7 : 1 }]}>
          <IconChat color={c.accent} size={20} />
          <T style={{ flex: 1, fontSize: 16, lineHeight: 22 }}>{question}</T>
        </Touchable>

        <Touchable
          accessibilityRole="button"
          onPress={onPlan}
          style={({ pressed }) => ({ marginTop: Space.md, opacity: pressed ? 0.6 : 1 })}>
          <T variant="muted">
            Plan recomendado para vos:{' '}
            <T style={{ fontFamily: Fonts.uiBold, color: c.accent }}>{planTitle} →</T>
          </T>
        </Touchable>
      </View>
      <Primary label={`Leer el devocional: ${d.title}`} onPress={onDevocional} />
    </View>
  );
}

function Feature({ Icon, title, detail }: { Icon: typeof IconSun; title: string; detail: string }) {
  const c = usePalette();
  return (
    <View style={styles.feature}>
      <View style={[styles.featureIcon, { backgroundColor: c.surface }]}>
        <Icon color={c.accent} size={22} />
      </View>
      <View style={{ flex: 1 }}>
        <T style={{ fontFamily: Fonts.uiBold, fontSize: 16 }}>{title}</T>
        <T variant="muted">{detail}</T>
      </View>
    </View>
  );
}

function Primary({ label, onPress }: { label: string; onPress: () => void }) {
  const c = usePalette();
  return (
    <Touchable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.primary, { backgroundColor: c.fill, opacity: pressed ? 0.85 : 1 }]}>
      <T style={{ color: c.fillInk, fontFamily: Fonts.uiBold, fontSize: 17 }} numberOfLines={1}>
        {label}
      </T>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    paddingHorizontal: Space.lg,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  dots: { flex: 1, flexDirection: 'row', gap: 6 },
  dot: { height: 4, borderRadius: 2 },
  page: {
    flexGrow: 1,
    paddingHorizontal: Space.lg,
    paddingTop: Space.xl,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  fill: { flex: 1, minHeight: 520 },
  hero: { fontFamily: Fonts.display, fontSize: 52, lineHeight: 60, letterSpacing: -1.6, marginTop: 4 },
  lead: { fontFamily: Fonts.ui, fontSize: 20, lineHeight: 28, marginTop: Space.sm },
  sub: { fontSize: 16, marginTop: Space.sm },
  feature: { flexDirection: 'row', alignItems: 'center', gap: Space.md },
  featureIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm, marginTop: Space.lg },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  input: {
    marginTop: Space.lg,
    fontFamily: Fonts.ui,
    fontSize: 20,
    borderRadius: Radius.sm,
    paddingHorizontal: Space.md,
    paddingVertical: 14,
  },
  verse: { marginTop: Space.lg, padding: Space.lg, borderRadius: Radius.md },
  verseText: { fontFamily: Fonts.read, fontSize: 19, lineHeight: 30, marginTop: Space.sm },
  ask: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    marginTop: Space.sm,
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Space.md,
  },
  primary: {
    borderRadius: Radius.pill,
    paddingVertical: 16,
    paddingHorizontal: Space.lg,
    alignItems: 'center',
    marginTop: Space.lg,
  },
});
