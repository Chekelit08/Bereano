import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { T } from '@/components/text';
import { Fonts, Space, usePalette } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Hoy' }} />
      <Tabs.Screen name="biblia" options={{ title: 'Biblia' }} />
    </Tabs>
  );
}

/** Barra de pestañas tipográfica, sin íconos: igual que la landing. */
type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

function TabBar({ state, descriptors, navigateToTab, insets }: TabBarProps) {
  const c = usePalette();
  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: c.bg, borderColor: c.line, paddingBottom: Math.max(insets.bottom, Space.sm) },
      ]}>
      {state.routes.map((route, i) => {
        const focused = state.index === i;
        const label = descriptors[route.key].options.title ?? route.name;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            onPress={() => !focused && navigateToTab(route.key)}
            style={styles.tab}>
            <T
              style={{
                fontFamily: focused ? Fonts.displayItalic : Fonts.display,
                fontSize: 19,
                color: focused ? c.accent : c.muted,
              }}>
              {label}
            </T>
            <View style={[styles.dot, { backgroundColor: focused ? c.accent : 'transparent' }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Space.sm },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 6, gap: 4 },
  dot: { width: 5, height: 5, borderRadius: 3 },
});
