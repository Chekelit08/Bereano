import { StyleSheet, View } from 'react-native';

import { IconChevron } from '@/components/icons';
import { PressLink } from '@/components/press-link';
import { T } from '@/components/text';
import { Fonts, Radius, Space, usePalette } from '@/constants/theme';
import type { Plan } from '@/data/planes';
import { planProgress } from '@/lib/planes';
import { usePlus } from '@/lib/plus';
import { useSettings } from '@/lib/settings';

/** Tarjeta de un plan de lectura, con su avance si ya empezó. */
export function PlanCard({ plan }: { plan: Plan }) {
  const c = usePalette();
  const { plans } = useSettings();
  const { isPlus } = usePlus();
  const prog = planProgress(plan, plans[plan.id]);
  return (
    <PressLink
      href={{ pathname: '/planes/[id]', params: { id: plan.id } }}
      accessibilityLabel={`${plan.title}, ${plan.days.length} días`}
      style={({ pressed }) => [styles.card, { backgroundColor: pressed ? c.surface2 : c.surface }]}>
      <View style={{ flex: 1 }}>
        <T variant="label">
          {plan.days.length} días{!plan.premium ? ' · Gratis' : isPlus ? '' : ' · Plus'}
          {prog.finished ? ' · Terminado' : ''}
        </T>
        <T style={styles.title}>{plan.title}</T>
        <T variant="muted">{plan.subtitle}</T>
        {prog.started && !prog.finished && (
          <View style={[styles.bar, { backgroundColor: c.surface2 }]}>
            <View
              style={[
                styles.barFill,
                { backgroundColor: c.fill, width: `${(prog.done / prog.total) * 100}%` },
              ]}
            />
          </View>
        )}
      </View>
      <IconChevron color={c.muted} />
    </PressLink>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    padding: Space.lg,
    borderRadius: Radius.md,
  },
  title: { fontFamily: Fonts.display, fontSize: 22, letterSpacing: -0.5, marginTop: 4 },
  bar: { height: 4, borderRadius: 2, marginTop: Space.md, overflow: 'hidden' },
  barFill: { height: 4, borderRadius: 2 },
});
