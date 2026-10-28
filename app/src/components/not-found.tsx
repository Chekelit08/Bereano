import { Stack } from 'expo-router';
import { View } from 'react-native';

import { T } from '@/components/text';
import { Space } from '@/constants/theme';

export function NotFound() {
  return (
    <View style={{ padding: Space.lg }}>
      <Stack.Screen options={{ title: 'No encontrado' }} />
      <T>No encontramos ese pasaje.</T>
    </View>
  );
}
