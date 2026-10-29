import { Redirect, Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { IconBook, IconChat, IconSun } from '@/components/icons';
import { T } from '@/components/text';
import { Fonts, Radius, Space, usePalette } from '@/constants/theme';
import { tap } from '@/lib/haptics';
import { useSettings } from '@/lib/settings';

const ICONS = { index: IconSun, companero: IconChat, biblia: IconBook } as const;

export default function TabsLayout() {
  const { loaded, onboarded } = useSettings();
  // Hasta leer lo guardado no se sabe si ya vio la bienvenida.
  if (!loaded) return null;
  if (!onboarded) return <Redirect href="/bienvenida" />;
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Hoy' }} />
      <Tabs.Screen name="companero" options={{ title: 'Compañero' }} />
      <Tabs.Screen name="biblia" options={{ title: 'Biblia' }} />
    </Tabs>
  );
}

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

/** Barra flotante: una píldora con íconos propios; la pestaña activa se enciende en dorado. */
function TabBar({ state, descriptors, navigateToTab, insets }: TabBarProps) {
  const c = usePalette();
  return (
    <View style={[styles.wrap, { backgroundColor: c.bg, paddingBottom: Math.max(insets.bottom, Space.sm) }]}>
      <View style={[styles.bar, { backgroundColor: c.surface, borderColor: c.line, shadowColor: '#0B1220' }]}>
        {state.routes.map((route, i) => {
          const focused = state.index === i;
          const label = descriptors[route.key].options.title ?? route.name;
          const Icon = ICONS[route.name as keyof typeof ICONS] ?? IconSun;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected: focused }}
              onPress={() => {
                if (focused) return;
                tap();
                navigateToTab(route.key);
              }}
              style={[styles.tab, focused && { backgroundColor: c.fill }]}>
              <Icon size={21} color={focused ? c.fillInk : c.muted} />
              <T style={{ fontFamily: Fonts.uiBold, fontSize: 12, color: focused ? c.fillInk : c.muted }}>
                {label}
              </T>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: Space.md, paddingTop: Space.xs },
  bar: {
    flexDirection: 'row',
    borderRadius: Radius.pill,
    padding: 6,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: Radius.pill,
  },
});
