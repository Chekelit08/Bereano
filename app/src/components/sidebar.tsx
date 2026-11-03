import { usePathname, useRouter, type Href } from 'expo-router';
import type { ComponentType } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  IconBook,
  IconChat,
  IconFlame,
  IconGear,
  IconPen,
  IconPray,
  IconSearch,
  IconPlans,
  IconSun,
  IconTag,
} from '@/components/icons';
import { Touchable } from '@/components/press-link';
import { T } from '@/components/text';
import { Fonts, Radius, Space, usePalette } from '@/constants/theme';
import { streak } from '@/lib/dias';
import { usePlus } from '@/lib/plus';
import { useSettings } from '@/lib/settings';

type Item = {
  label: string;
  href: Href;
  Icon: ComponentType<{ color: string; size?: number }>;
  match: (p: string) => boolean;
};

const BIBLE_PATH = /^\/[1-3a-z][a-z0-9]{2}\/\d+/;

const MAIN: Item[] = [
  { label: 'Hoy', href: '/', Icon: IconSun, match: (p) => p === '/' || p.startsWith('/devocional') },
  {
    label: 'Biblia',
    href: '/biblia',
    Icon: IconBook,
    match: (p) => p === '/biblia' || BIBLE_PATH.test(p) || p === '/buscar',
  },
  { label: 'Compañero', href: '/companero', Icon: IconChat, match: (p) => p === '/companero' },
  { label: 'Planes', href: '/planes', Icon: IconPlans, match: (p) => p.startsWith('/planes') },
  { label: 'Versículos por tema', href: '/temas', Icon: IconTag, match: (p) => p.startsWith('/temas') },
];
const MINE: Item[] = [
  { label: 'Diario de oración', href: '/oracion', Icon: IconPray, match: (p) => p === '/oracion' },
  { label: 'Mis resaltados', href: '/resaltados', Icon: IconPen, match: (p) => p === '/resaltados' },
  { label: 'Racha', href: '/racha', Icon: IconFlame, match: (p) => p === '/racha' },
  { label: 'Ajustes', href: '/ajustes', Icon: IconGear, match: (p) => p === '/ajustes' },
];

/** Barra lateral de la versión de escritorio (como la web de las apps de Biblia grandes). */
export function Sidebar() {
  const c = usePalette();
  const router = useRouter();
  const pathname = usePathname();
  const { days } = useSettings();
  const { isPlus } = usePlus();
  const racha = streak(days);

  const row = (it: Item) => {
    const on = it.match(pathname);
    return (
      <Touchable
        key={it.label}
        accessibilityRole="link"
        accessibilityState={{ selected: on }}
        onPress={() => router.navigate(it.href)}
        style={({ pressed }) => [
          styles.item,
          { backgroundColor: on ? c.surface2 : pressed ? c.surface : 'transparent' },
        ]}>
        <it.Icon color={on ? c.text : c.muted} size={20} />
        <T
          style={{
            fontFamily: on ? Fonts.uiBold : Fonts.uiSemi,
            fontSize: 15,
            color: on ? c.text : c.muted,
          }}>
          {it.label}
        </T>
      </Touchable>
    );
  };

  return (
    <View style={[styles.wrap, { backgroundColor: c.surface, borderColor: c.line }]}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Touchable accessibilityRole="link" onPress={() => router.navigate('/')} style={styles.brand}>
          <View style={[styles.logo, { backgroundColor: c.fill }]}>
            <IconBook color={c.fillInk} size={18} />
          </View>
          <T style={{ fontFamily: Fonts.display, fontSize: 20, letterSpacing: -0.4 }}>Bereano</T>
        </Touchable>

        <Touchable
          accessibilityRole="search"
          onPress={() => router.navigate('/buscar')}
          style={({ pressed }) => [
            styles.search,
            { backgroundColor: c.bg, borderColor: c.line, opacity: pressed ? 0.8 : 1 },
          ]}>
          <IconSearch color={c.muted} size={17} />
          <T style={{ color: c.muted, fontSize: 14 }}>Buscar versículos…</T>
        </Touchable>

        <View style={styles.group}>{MAIN.map(row)}</View>
        <T variant="label" style={styles.groupTitle}>
          Lo tuyo
        </T>
        <View style={styles.group}>{MINE.map(row)}</View>

        <View style={[styles.streak, { backgroundColor: c.bg }]}>
          <IconFlame color={racha > 0 ? c.fill : c.muted} size={20} />
          <View style={{ flex: 1 }}>
            <T style={{ fontFamily: Fonts.uiBold }}>
              {racha} {racha === 1 ? 'día seguido' : 'días seguidos'}
            </T>
            <T variant="muted" style={{ fontSize: 13 }}>
              {racha > 0 ? 'Seguí así' : 'Leé el devocional para empezar'}
            </T>
          </View>
        </View>

        {!isPlus && (
          <Touchable
            accessibilityRole="link"
            onPress={() => router.navigate('/plus')}
            style={({ pressed }) => [styles.plus, { backgroundColor: c.fill, opacity: pressed ? 0.9 : 1 }]}>
            <T style={{ color: c.fillInk, fontFamily: Fonts.uiBold, fontSize: 15 }}>Bereano Plus</T>
            <T style={{ color: c.fillInk, opacity: 0.85, fontSize: 13 }}>
              Compañero sin límite de regalo, planes por tema y todos los diseños. 7 días gratis.
            </T>
          </Touchable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 264, borderRightWidth: StyleSheet.hairlineWidth },
  inner: { padding: Space.md, paddingTop: Space.lg, gap: Space.sm, minHeight: '100%' },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 8,
    marginBottom: Space.sm,
  },
  logo: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: Space.sm,
  },
  group: { gap: 2 },
  groupTitle: { marginTop: Space.md, marginBottom: 2, paddingHorizontal: 10 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: Space.md,
    borderRadius: Radius.sm,
    marginTop: Space.lg,
  },
  plus: { padding: Space.md, borderRadius: Radius.sm, gap: 4 },
});
