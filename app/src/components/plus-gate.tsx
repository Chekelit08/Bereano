import { StyleSheet, View } from 'react-native';

import { IconLock } from '@/components/icons';
import { PressLink } from '@/components/press-link';
import { T } from '@/components/text';
import { Fonts, Radius, Space, usePalette } from '@/constants/theme';

/** Tarjeta "Esto es de Plus" con el botón al paywall. */
export function PlusGate({ title, detail }: { title: string; detail: string }) {
  const c = usePalette();
  return (
    <View style={[styles.box, { backgroundColor: c.surface }]}>
      <View style={[styles.badge, { backgroundColor: c.fill }]}>
        <IconLock color={c.fillInk} size={12} />
        <T style={{ color: c.fillInk, fontFamily: Fonts.uiBold, fontSize: 12 }}>Plus</T>
      </View>
      <T style={{ fontFamily: Fonts.uiBold, fontSize: 17, marginTop: Space.sm }}>{title}</T>
      <T variant="muted" style={{ marginTop: 4 }}>
        {detail}
      </T>
      <PressLink
        href="/plus"
        style={({ pressed }) => [styles.btn, { backgroundColor: c.fill, opacity: pressed ? 0.85 : 1 }]}>
        <T style={{ color: c.fillInk, fontFamily: Fonts.uiBold }}>Probar Plus gratis</T>
      </PressLink>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { padding: Space.lg, borderRadius: Radius.md },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  btn: { marginTop: Space.md, borderRadius: Radius.pill, paddingVertical: 12, alignItems: 'center' },
});
