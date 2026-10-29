import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { NotFound } from '@/components/not-found';
import { PressLink, Touchable } from '@/components/press-link';
import { T } from '@/components/text';
import { Fonts, Radius, Space, usePalette } from '@/constants/theme';
import { getPlan, readingLabel } from '@/data/planes';
import { getBook, getChapter } from '@/lib/bible';
import { success } from '@/lib/haptics';
import { useSettings } from '@/lib/settings';

export default function PlanDia() {
  const c = usePalette();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; dia: string }>();
  const plan = getPlan(params.id);
  const index = Number(params.dia) - 1;
  const day = plan && Number.isInteger(index) ? plan.days[index] : undefined;
  const { plans, startPlan, togglePlanDay, markDay, fontSize } = useSettings();
  if (!plan || !day) return <NotFound />;

  const done = !!plans[plan.id]?.done.includes(index);
  const isLast = index === plan.days.length - 1;
  const lineHeight = Math.round(fontSize * 1.75);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Stack.Screen options={{ title: plan.title }} />
      <T variant="label">
        Día {index + 1} de {plan.days.length}
      </T>
      <T variant="title" style={{ marginTop: 4 }}>
        {day.title}
      </T>

      {/* El texto sale de la Biblia de la app, nunca escrito a mano. */}
      {day.readings.map((r, k) => {
        const book = getBook(r.book)!;
        const chapter = getChapter(r.book, r.chapter)!;
        const from = r.from ?? 1;
        const to = r.from ? (r.to ?? r.from) : chapter.length;
        return (
          <View key={k} style={{ marginTop: Space.xl }}>
            <PressLink
              href={{ pathname: '/[book]/[chapter]', params: { book: r.book, chapter: r.chapter, v: from } }}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, marginBottom: Space.sm })}>
              <T style={{ fontFamily: Fonts.uiBold, fontSize: 15, color: c.accent }}>
                {readingLabel(book.name, r)} →
              </T>
            </PressLink>
            {chapter.slice(from - 1, to).map((text, i) => (
              <T key={i} style={{ fontFamily: Fonts.read, fontSize, lineHeight, marginBottom: 8 }} selectable>
                <T style={{ fontFamily: Fonts.uiBold, fontSize: Math.round(fontSize * 0.6), color: c.muted }}>
                  {from + i}{' '}
                </T>
                {text}
              </T>
            ))}
          </View>
        );
      })}

      <View style={[styles.focus, { backgroundColor: c.surface }]}>
        <T variant="label">Para aplicar hoy</T>
        <T
          style={{
            fontFamily: Fonts.display,
            fontSize: 20,
            lineHeight: 27,
            letterSpacing: -0.4,
            marginTop: Space.sm,
          }}>
          {day.focus}
        </T>
      </View>

      <Touchable
        accessibilityRole="button"
        accessibilityState={{ checked: done }}
        onPress={() => {
          if (!plans[plan.id]) startPlan(plan.id);
          if (!done) {
            success();
            markDay('read');
          }
          togglePlanDay(plan.id, index);
        }}
        style={({ pressed }) => [
          styles.cta,
          { backgroundColor: done ? c.surface2 : c.fill, opacity: pressed ? 0.85 : 1 },
        ]}>
        <T style={{ fontFamily: Fonts.uiBold, fontSize: 16, color: done ? c.text : c.fillInk }}>
          {done ? `Día ${index + 1} leído ✓` : 'Marcar como leído'}
        </T>
      </Touchable>

      {done && (
        <Touchable
          accessibilityRole="button"
          onPress={() =>
            isLast
              ? router.replace({ pathname: '/planes/[id]', params: { id: plan.id } })
              : router.replace({ pathname: '/planes/[id]/[dia]', params: { id: plan.id, dia: index + 2 } })
          }
          style={({ pressed }) => [styles.next, { opacity: pressed ? 0.6 : 1 }]}>
          <T style={{ fontFamily: Fonts.uiBold, fontSize: 16, color: c.accent }}>
            {isLast ? 'Terminaste el plan. Ver resumen →' : `Seguir con el día ${index + 2} →`}
          </T>
        </Touchable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: Space.lg, paddingBottom: Space.xxl, maxWidth: 720, width: '100%', alignSelf: 'center' },
  focus: { marginTop: Space.xl, padding: Space.lg, borderRadius: Radius.md },
  cta: { marginTop: Space.lg, borderRadius: Radius.pill, paddingVertical: 16, alignItems: 'center' },
  next: { alignSelf: 'center', padding: Space.md, marginTop: Space.sm },
});
