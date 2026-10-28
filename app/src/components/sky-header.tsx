import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { momentOf, Sky } from '@/components/sky';
import { T } from '@/components/text';
import { Fonts, Space } from '@/constants/theme';

/** Encabezado con el cielo de la hora: une todas las pestañas con la pantalla Hoy. */
export function SkyHeader({
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
  const insets = useSafeAreaInsets();
  const [moment] = useState(() => momentOf());
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + Space.md }]}>
      <Sky moment={moment} />
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <T style={styles.kicker}>{kicker}</T>
          <T style={styles.title}>
            {title}
            {accent ? <T style={[styles.title, { fontFamily: Fonts.displayItalic }]}> {accent}</T> : null}
          </T>
        </View>
        {right}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: Space.lg, paddingBottom: Space.xl + 8, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'flex-end' },
  kicker: {
    fontFamily: Fonts.uiBold,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: '#FFFFFFD9',
  },
  title: { fontFamily: Fonts.display, fontSize: 44, lineHeight: 50, color: '#FFFFFF', marginTop: 4 },
});
