import { Stack } from 'expo-router';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';

import { Touchable } from '@/components/press-link';
import { T } from '@/components/text';
import { Fonts, Space, usePalette } from '@/constants/theme';
import { EMERGENCY, HELP_LINES } from '@/data/ayuda';

function userCountry(): string | undefined {
  return Intl.DateTimeFormat().resolvedOptions().locale.split('-')[1];
}

/** Pantalla de ayuda en crisis: cálida, corta, sin sermones, con a quién llamar ya. */
export default function Ayuda() {
  const c = usePalette();
  const mine = userCountry();
  const countries = Object.keys(HELP_LINES).sort((a, b) => Number(b === mine) - Number(a === mine));

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Stack.Screen options={{ title: 'No estás solo', presentation: 'modal' }} />
      <T variant="title" style={{ fontSize: 34, lineHeight: 40 }}>
        No estás solo.
      </T>
      <T style={{ marginTop: Space.md }}>
        Lo que estás sintiendo importa. Hablar con alguien ahora puede ayudar: una persona de confianza, tu
        pastor, o una línea de ayuda. Atienden personas capacitadas, es gratis y es confidencial.
      </T>
      <T style={{ marginTop: Space.sm }}>Si estás en peligro inmediato, llamá a emergencias.</T>

      {countries.map((code) => {
        const { country, lines } = HELP_LINES[code];
        return (
          <View key={code} style={[styles.card, { borderColor: c.line, backgroundColor: c.surface }]}>
            <T variant="label">{country}</T>
            {lines.map((l) => (
              <View key={l.phone} style={{ marginTop: Space.sm }}>
                <T style={{ fontFamily: Fonts.displayMedium, fontSize: 18 }}>{l.name}</T>
                {l.note && <T variant="muted">{l.note}</T>}
                <Touchable
                  accessibilityRole="button"
                  accessibilityLabel={`Llamar a ${l.name}`}
                  onPress={() => Linking.openURL(`tel:${l.phone.replace(/\s/g, '')}`)}
                  style={({ pressed }) => [
                    styles.call,
                    { backgroundColor: c.accent, opacity: pressed ? 0.8 : 1 },
                  ]}>
                  <T style={{ color: c.accentInk, fontFamily: Fonts.displayMedium, fontSize: 18 }}>
                    Llamar al {l.phone}
                  </T>
                </Touchable>
              </View>
            ))}
            {EMERGENCY[code] && (
              <T variant="muted" style={{ marginTop: Space.sm }}>
                Emergencias: {EMERGENCY[code]}
              </T>
            )}
          </View>
        );
      })}

      <T variant="muted" style={{ marginTop: Space.lg }}>
        ¿Tu país no está? Llamá al número de emergencias local o buscá a alguien de confianza cerca tuyo.
      </T>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: Space.lg, paddingBottom: Space.xxl, maxWidth: 720, width: '100%', alignSelf: 'center' },
  card: { marginTop: Space.lg, padding: Space.lg, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth },
  call: { marginTop: Space.sm, borderRadius: 999, paddingVertical: 12, alignItems: 'center' },
});
