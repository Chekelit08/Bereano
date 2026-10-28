import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { T } from '@/components/text';
import { Fonts, Space, usePalette } from '@/constants/theme';

/** Encabezado de pestaña: etiqueta chica, título en Newsreader y una acción opcional. */
export function PageHeader({
  kicker,
  title,
  accent,
  right,
  children,
}: {
  kicker: string;
  title: string;
  accent?: string;
  right?: ReactNode;
  children?: ReactNode;
}) {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + Space.lg }]}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <T variant="label">{kicker}</T>
          <T variant="title" style={{ marginTop: 4 }}>
            {title}
            {accent ? (
              <T variant="title" style={{ fontFamily: Fonts.displayItalic, color: c.accent }}>
                {' '}
                {accent}
              </T>
            ) : null}
          </T>
        </View>
        {right}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: Space.lg, paddingBottom: Space.md },
  row: { flexDirection: 'row', alignItems: 'flex-end' },
});
