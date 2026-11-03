import { ScrollView, StyleSheet, View } from 'react-native';

import { Cover } from '@/components/cover';
import { PressLink } from '@/components/press-link';
import { T } from '@/components/text';
import { Fonts, Space, usePalette } from '@/constants/theme';
import { GUIDES } from '@/data/oracion-guiada';
import { usePlus } from '@/lib/plus';

const COLORS: Record<string, [string, string]> = {
  acts: ['#0071E3', '#22B8CF'],
  'salmo-23': ['#2B8A3E', '#94D82D'],
  'por-otros': ['#C2255C', '#FF922B'],
};

/** Oración guiada: guías cortas con un versículo y un rato de silencio en cada paso. */
export default function OracionGuiada() {
  const c = usePalette();
  const { isPlus } = usePlus();
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <T variant="title">
        Oración{' '}
        <T variant="title" style={{ color: c.muted }}>
          guiada
        </T>
      </T>
      <T variant="muted" style={{ marginTop: Space.sm, fontSize: 16 }}>
        Unos minutos con Dios, paso a paso. Cada paso trae un versículo y un rato en silencio.
      </T>
      <View style={{ gap: Space.md, marginTop: Space.lg }}>
        {GUIDES.map((g) => (
          <PressLink
            key={g.id}
            href={g.premium && !isPlus ? '/plus' : { pathname: '/oracion-guiada/[id]', params: { id: g.id } }}
            style={({ pressed }) => [styles.row, { backgroundColor: c.surface, opacity: pressed ? 0.8 : 1 }]}>
            <Cover
              id={`guia-${g.id}`}
              title={g.title}
              colors={COLORS[g.id] ?? ['#495057', '#868E96']}
              size={76}
            />
            <View style={{ flex: 1 }}>
              <T variant="label">
                {g.minutes} min · {g.steps.length} pasos{g.premium ? (isPlus ? '' : ' · Plus') : ' · Gratis'}
              </T>
              <T style={{ fontFamily: Fonts.uiBold, fontSize: 17, marginTop: 2 }}>{g.title}</T>
              <T variant="muted">{g.subtitle}</T>
            </View>
          </PressLink>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: Space.lg, paddingBottom: Space.xxl, maxWidth: 720, width: '100%', alignSelf: 'center' },
  row: { flexDirection: 'row', gap: Space.md, alignItems: 'center', padding: Space.md, borderRadius: 18 },
});
