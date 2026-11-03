import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { PlusGate } from '@/components/plus-gate';
import { PressLink, Touchable } from '@/components/press-link';
import { T } from '@/components/text';
import { Fonts, Radius, Space, usePalette } from '@/constants/theme';
import { track } from '@/lib/analytics';
import { dayKey } from '@/lib/dias';
import { success } from '@/lib/haptics';
import { FREE_JOURNAL, JOURNAL_MAX } from '@/lib/personal';
import { usePlus } from '@/lib/plus';
import { useSettings } from '@/lib/settings';

/** "Tu respuesta": escribir la respuesta a la pregunta del devocional. Queda en el teléfono. */
export function JournalBox({ devocionalId }: { devocionalId: string }) {
  const c = usePalette();
  const { journal, setJournal } = useSettings();
  const { isPlus } = usePlus();
  const today = dayKey();
  const saved = journal[today]?.id === devocionalId ? journal[today].text : '';
  const [text, setText] = useState(saved);
  const [editing, setEditing] = useState(!saved);
  const count = Object.keys(journal).length;
  const locked = !isPlus && !saved && count >= FREE_JOURNAL;

  if (locked)
    return (
      <PlusGate
        title="Seguí escribiendo tu diario"
        detail={`Ya guardaste ${FREE_JOURNAL} respuestas. Con Bereano Plus, tu diario no tiene límite.`}
      />
    );

  if (!editing && saved)
    return (
      <View style={[styles.box, { backgroundColor: c.surface }]}>
        <T variant="label">Tu respuesta de hoy</T>
        <T style={{ fontFamily: Fonts.read, fontSize: 17, lineHeight: 27, marginTop: Space.sm }}>{saved}</T>
        <View style={styles.row}>
          <Touchable
            accessibilityRole="button"
            onPress={() => setEditing(true)}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
            <T style={{ fontFamily: Fonts.uiBold, color: c.accent }}>Editar</T>
          </Touchable>
          <PressLink href="/diario" style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
            <T style={{ fontFamily: Fonts.uiBold, color: c.accent }}>Ver mi diario →</T>
          </PressLink>
        </View>
      </View>
    );

  return (
    <View style={[styles.box, { backgroundColor: c.surface }]}>
      <T variant="label">Tu respuesta</T>
      <TextInput
        value={text}
        onChangeText={(t) => setText(t.slice(0, JOURNAL_MAX))}
        placeholder="Escribí lo que te dice Dios hoy…"
        placeholderTextColor={c.muted}
        multiline
        accessibilityLabel="Tu respuesta a la pregunta de hoy"
        style={[styles.input, { color: c.text, backgroundColor: c.bg }]}
      />
      <View style={styles.row}>
        <T variant="muted" style={{ fontSize: 12, flex: 1 }}>
          Queda solo en este teléfono.
          {!isPlus ? ` ${Math.max(0, FREE_JOURNAL - count)} gratis por ahora.` : ''}
        </T>
        <Touchable
          accessibilityRole="button"
          disabled={!text.trim()}
          onPress={() => {
            setJournal(today, devocionalId, text);
            setEditing(false);
            success();
            track('diario_guardado');
          }}
          style={({ pressed }) => [
            styles.save,
            { backgroundColor: c.fill, opacity: !text.trim() ? 0.4 : pressed ? 0.85 : 1 },
          ]}>
          <T style={{ color: c.fillInk, fontFamily: Fonts.uiBold }}>Guardar</T>
        </Touchable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { marginTop: Space.lg, padding: Space.lg, borderRadius: Radius.md },
  input: {
    marginTop: Space.sm,
    minHeight: 100,
    borderRadius: Radius.sm,
    padding: Space.md,
    fontFamily: Fonts.read,
    fontSize: 17,
    lineHeight: 26,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Space.md,
    marginTop: Space.md,
  },
  save: { borderRadius: Radius.pill, paddingHorizontal: Space.lg, paddingVertical: 10 },
});
