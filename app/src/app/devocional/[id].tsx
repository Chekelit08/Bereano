import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView } from 'react-native';

import { DevocionalView } from '@/components/devocional-view';
import { NotFound } from '@/components/not-found';
import { Space } from '@/constants/theme';
import { getDevocional } from '@/data/devocionales';

export default function DevocionalGuardado() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const d = getDevocional(id);
  if (!d) return <NotFound />;
  return (
    <ScrollView contentContainerStyle={{ padding: Space.lg, paddingBottom: Space.xxl }}>
      <Stack.Screen options={{ title: '' }} />
      <DevocionalView devocional={d} kicker="Devocional guardado" />
    </ScrollView>
  );
}
