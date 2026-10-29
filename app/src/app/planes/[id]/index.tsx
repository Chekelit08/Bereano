import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { IconCheck, IconChevron } from '@/components/icons';
import { NotFound } from '@/components/not-found';
import { PressLink, Touchable } from '@/components/press-link';
import { T } from '@/components/text';
import { Fonts, Radius, Space, usePalette } from '@/constants/theme';
import { getPlan, readingLabel } from '@/data/planes';
import { getBook } from '@/lib/bible';
import { planProgress } from '@/lib/planes';
import { usePlus } from '@/lib/plus';
import { useSettings } from '@/lib/settings';

export default function PlanDetalle() {
  const c = usePalette();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const plan = getPlan(id);
  const { plans, startPlan, togglePlanDay, leavePlan } = useSettings();
  const { isPlus } = usePlus();
  if (!plan) return <NotFound />;

  const state = plans[plan.id];
  const prog = planProgress(plan, state);
  // Planes por tema: el día 1 es gratis para probar; el resto, con Plus.
  const locked = plan.premium && !isPlus;
  const goTo = (day: number) =>
    router.push({ pathname: '/planes/[id]/[dia]', params: { id: plan.id, dia: day + 1 } });

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Stack.Screen options={{ title: '' }} />
      <T variant="label">
        Plan de {plan.days.length} días{!plan.premium ? ' · Gratis' : ''}
      </T>
      <T variant="title" style={{ marginTop: 4 }}>
        {plan.title}
      </T>
      <T variant="muted" style={{ fontSize: 16, marginTop: Space.sm }}>
        {plan.description}
      </T>

      {prog.started && (
        <View style={{ marginTop: Space.lg }}>
          <T variant="label">{prog.finished ? 'Terminaste el plan' : `${prog.done} de ${prog.total} días`}</T>
          <View style={[styles.bar, { backgroundColor: c.surface2 }]}>
            <View
              style={[
                styles.barFill,
                { backgroundColor: c.fill, width: `${(prog.done / prog.total) * 100}%` },
              ]}
            />
          </View>
        </View>
      )}

      <Touchable
        accessibilityRole="button"
        onPress={() => {
          if (locked && prog.next > 0) return router.push('/plus');
          if (!prog.started) startPlan(plan.id);
          goTo(prog.next);
        }}
        style={({ pressed }) => [styles.cta, { backgroundColor: c.fill, opacity: pressed ? 0.85 : 1 }]}>
        <T style={{ fontFamily: Fonts.uiBold, fontSize: 16, color: c.fillInk }}>
          {locked && prog.next > 0
            ? 'Seguir con Bereano Plus'
            : !prog.started
              ? locked
                ? 'Leer el día 1 gratis'
                : 'Empezar el plan'
              : prog.finished
                ? 'Volver a leer'
                : `Seguir con el día ${prog.next + 1}`}
        </T>
      </Touchable>

      <View style={{ marginTop: Space.xl }}>
        {plan.days.map((d, i) => {
          const done = !!state?.done.includes(i);
          return (
            <View key={i} style={[styles.day, { borderColor: c.line }]}>
              <Touchable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: done }}
                accessibilityLabel={`Día ${i + 1} leído`}
                hitSlop={8}
                onPress={() => {
                  if (!prog.started) startPlan(plan.id);
                  togglePlanDay(plan.id, i);
                }}>
                <IconCheck color={done ? c.fill : c.muted} filled={done} size={26} />
              </Touchable>
              <PressLink
                href={{ pathname: '/planes/[id]/[dia]', params: { id: plan.id, dia: i + 1 } }}
                style={({ pressed }) => [styles.dayLink, { opacity: pressed ? 0.6 : 1 }]}>
                <View style={{ flex: 1 }}>
                  <T variant="label">Día {i + 1}</T>
                  <T style={{ fontFamily: Fonts.uiBold, fontSize: 16, marginTop: 2 }}>{d.title}</T>
                  <T variant="muted">
                    {d.readings.map((r) => readingLabel(getBook(r.book)!.name, r)).join(' · ')}
                  </T>
                </View>
                <IconChevron color={c.muted} />
              </PressLink>
            </View>
          );
        })}
      </View>

      {prog.started && (
        <Touchable
          accessibilityRole="button"
          onPress={() => leavePlan(plan.id)}
          style={({ pressed }) => ({ alignSelf: 'center', padding: Space.md, opacity: pressed ? 0.5 : 1 })}>
          <T variant="muted">Dejar este plan</T>
        </Touchable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: Space.lg, paddingBottom: Space.xxl, maxWidth: 720, width: '100%', alignSelf: 'center' },
  bar: { height: 6, borderRadius: 3, marginTop: Space.sm, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
  cta: { marginTop: Space.lg, borderRadius: Radius.pill, paddingVertical: 16, alignItems: 'center' },
  day: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dayLink: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Space.sm },
});
