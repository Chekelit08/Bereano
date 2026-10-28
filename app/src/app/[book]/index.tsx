import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { NotFound } from '@/components/not-found';
import { PressLink } from '@/components/press-link';
import { T } from '@/components/text';
import { Fonts, Space, usePalette } from '@/constants/theme';
import { getBook } from '@/lib/bible';

export default function Chapters() {
  const c = usePalette();
  const { book: code } = useLocalSearchParams<{ book: string }>();
  const book = getBook(code);

  if (!book) return <NotFound />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: book.name }} />
      <T variant="label">Capítulos</T>
      <View style={styles.grid}>
        {Array.from({ length: book.chapters }, (_, i) => i + 1).map((n) => (
          <PressLink
            key={n}
            href={{ pathname: '/[book]/[chapter]', params: { book: book.code, chapter: n } }}
            accessibilityLabel={`${book.name} capítulo ${n}`}
            style={({ pressed }) => [
              styles.cell,
              { borderColor: c.line, backgroundColor: pressed ? c.accent : c.surface },
            ]}>
            {({ pressed }) => <T style={[styles.num, { color: pressed ? c.accentInk : c.text }]}>{n}</T>}
          </PressLink>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: Space.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: Space.md },
  cell: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  num: { fontFamily: Fonts.display, fontSize: 19 },
});
