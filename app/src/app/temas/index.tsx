import { ScrollView, StyleSheet, View } from 'react-native';

import { Cover } from '@/components/cover';
import { PressLink } from '@/components/press-link';
import { T } from '@/components/text';
import { Space, usePalette } from '@/constants/theme';
import { TEMAS } from '@/data/temas';

const TILE = 160;

/** "Versículos sobre…": temas para lo que estás viviendo. */
export default function Temas() {
  const c = usePalette();
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <T variant="title">
        Versículos{' '}
        <T variant="title" style={{ color: c.muted }}>
          sobre…
        </T>
      </T>
      <T variant="muted" style={{ marginTop: Space.sm, fontSize: 16 }}>
        Pasajes de la Biblia para lo que estás viviendo hoy.
      </T>
      <View style={styles.grid}>
        {TEMAS.map((t) => (
          <PressLink
            key={t.id}
            href={{ pathname: '/temas/[id]', params: { id: t.id } }}
            accessibilityLabel={`Versículos sobre ${t.title}`}
            style={({ pressed }) => [styles.tile, { opacity: pressed ? 0.8 : 1 }]}>
            <Cover
              id={`tema-${t.id}`}
              title={t.title}
              kicker={`${t.refs.length} versículos`}
              colors={t.colors}
              size={TILE}
            />
            <T variant="muted" style={{ marginTop: 6, fontSize: 13 }}>
              {t.subtitle}
            </T>
          </PressLink>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: Space.lg, paddingBottom: Space.xxl, maxWidth: 1000, width: '100%', alignSelf: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.md, marginTop: Space.lg },
  tile: { width: TILE },
});
