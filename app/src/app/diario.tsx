import { ScrollView, StyleSheet, View } from 'react-native';

import { PressLink } from '@/components/press-link';
import { T } from '@/components/text';
import { Fonts, Space, usePalette } from '@/constants/theme';
import { getDevocional } from '@/data/devocionales';
import { useSettings } from '@/lib/settings';

/** Mi diario: las respuestas a las preguntas de cada devocional, de la más nueva a la más vieja. */
export default function Diario() {
  const c = usePalette();
  const { journal } = useSettings();
  const entries = Object.entries(journal).sort((a, b) => b[0].localeCompare(a[0]));
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <T variant="title">
        Mi{' '}
        <T variant="title" style={{ color: c.muted }}>
          diario
        </T>
      </T>
      <T variant="muted" style={{ marginTop: Space.sm, fontSize: 16 }}>
        Tus respuestas a la pregunta de cada devocional. Quedan solo en este teléfono.
      </T>
      {entries.length === 0 ? (
        <T variant="muted" style={{ marginTop: Space.xl }}>
          Todavía no escribiste. Abajo de la pregunta de cada devocional hay un espacio para tu respuesta.
        </T>
      ) : (
        entries.map(([day, e]) => {
          const d = getDevocional(e.id);
          const [y, m, dd] = day.split('-').map(Number);
          return (
            <View key={day} style={[styles.entry, { borderColor: c.line }]}>
              <T variant="label">
                {new Date(y, m - 1, dd).toLocaleDateString('es', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </T>
              {d && (
                <PressLink
                  href={{ pathname: '/devocional/[id]', params: { id: d.id } }}
                  style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
                  <T style={{ fontFamily: Fonts.uiBold, color: c.accent, marginTop: 2 }}>{d.title}</T>
                  <T variant="muted" style={{ fontSize: 14 }}>
                    {d.question}
                  </T>
                </PressLink>
              )}
              <T style={{ fontFamily: Fonts.read, fontSize: 17, lineHeight: 27, marginTop: Space.sm }}>
                {e.text}
              </T>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: Space.lg, paddingBottom: Space.xxl, maxWidth: 720, width: '100%', alignSelf: 'center' },
  entry: { paddingVertical: Space.lg, borderBottomWidth: StyleSheet.hairlineWidth },
});
