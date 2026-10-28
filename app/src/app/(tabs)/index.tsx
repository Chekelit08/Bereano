import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DevocionalView } from '@/components/devocional-view';
import { PressLink } from '@/components/press-link';
import { T } from '@/components/text';
import { Fonts, Space, usePalette } from '@/constants/theme';
import { devocionalDelDia, getDevocional } from '@/data/devocionales';
import { formatRef, getBook } from '@/lib/bible';
import { useSettings } from '@/lib/settings';

export default function Hoy() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { saved } = useSettings();
  const today = devocionalDelDia();
  const date = new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });
  const savedList = saved.map(getDevocional).filter((d) => d && d.id !== today.id);

  return (
    <ScrollView contentContainerStyle={[styles.page, { paddingTop: insets.top + Space.lg }]}>
      <DevocionalView devocional={today} kicker={`Devocional · ${date}`} />

      {savedList.length > 0 && (
        <View style={{ marginTop: Space.xxl }}>
          <T variant="label">Guardados</T>
          {savedList.map(
            (d) =>
              d && (
                <PressLink
                  key={d.id}
                  href={{ pathname: '/devocional/[id]', params: { id: d.id } }}
                  style={({ pressed }) => [
                    styles.saved,
                    { borderColor: c.line, opacity: pressed ? 0.6 : 1 },
                  ]}>
                  <T style={{ fontFamily: Fonts.display, fontSize: 19 }}>{d.title}</T>
                  <T variant="muted">{formatRef(getBook(d.book)!, d.chapter, d.from, d.to)}</T>
                </PressLink>
              ),
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: Space.lg,
    paddingBottom: Space.xxl,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  saved: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
});
