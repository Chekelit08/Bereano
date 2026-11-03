import { Stack } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Cover } from '@/components/cover';
import { PlanCard } from '@/components/plan-card';
import { PressLink } from '@/components/press-link';
import { T } from '@/components/text';
import { Fonts, Space } from '@/constants/theme';
import { PLAN_COLORS, PLANES } from '@/data/planes';
import { planProgress } from '@/lib/planes';
import { usePlus } from '@/lib/plus';
import { useSettings } from '@/lib/settings';

export default function Planes() {
  const { plans } = useSettings();
  const { isPlus } = usePlus();
  const active = PLANES.filter((p) => plans[p.id] && !planProgress(p, plans[p.id]).finished);
  const rest = PLANES.filter((p) => !active.includes(p));

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Stack.Screen options={{ title: 'Planes de lectura' }} />
      <T variant="muted">
        Un pasaje por día y una pregunta para aplicarlo. Tu avance queda guardado en este teléfono.
      </T>

      {active.length > 0 && (
        <View style={styles.section}>
          <T variant="heading">En curso</T>
          {active.map((p) => (
            <PlanCard key={p.id} plan={p} />
          ))}
        </View>
      )}

      <View style={styles.section}>
        <T variant="heading">{active.length ? 'Más planes' : 'Elegí un plan'}</T>
        <View style={styles.grid}>
          {rest.map((p) => (
            <PressLink
              key={p.id}
              href={{ pathname: '/planes/[id]', params: { id: p.id } }}
              accessibilityLabel={`${p.title}, ${p.days.length} días`}
              style={({ pressed }) => [styles.tile, { opacity: pressed ? 0.8 : 1 }]}>
              <Cover
                id={p.id}
                title={p.title}
                kicker={`${p.days.length} días`}
                colors={PLAN_COLORS[p.id] ?? ['#495057', '#868E96']}
                size={TILE}
              />
              <T style={{ fontFamily: Fonts.uiBold, fontSize: 15, marginTop: Space.sm }}>{p.subtitle}</T>
              <T variant="muted" style={{ fontSize: 13 }}>
                {p.premium ? (isPlus ? 'Plan por tema' : 'Día 1 gratis · Plus') : 'Gratis'}
              </T>
            </PressLink>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const TILE = 160;

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.md },
  tile: { width: TILE },
  page: { padding: Space.lg, paddingBottom: Space.xxl, maxWidth: 720, width: '100%', alignSelf: 'center' },
  section: { marginTop: Space.xl, gap: Space.sm },
});
