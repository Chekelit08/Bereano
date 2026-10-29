import { Stack } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { PlanCard } from '@/components/plan-card';
import { T } from '@/components/text';
import { Space } from '@/constants/theme';
import { PLANES } from '@/data/planes';
import { planProgress } from '@/lib/planes';
import { useSettings } from '@/lib/settings';

export default function Planes() {
  const { plans } = useSettings();
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
        {rest.map((p) => (
          <PlanCard key={p.id} plan={p} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: Space.lg, paddingBottom: Space.xxl, maxWidth: 720, width: '100%', alignSelf: 'center' },
  section: { marginTop: Space.xl, gap: Space.sm },
});
