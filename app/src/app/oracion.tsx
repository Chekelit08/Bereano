import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { IconCheck } from '@/components/icons';
import { Touchable } from '@/components/press-link';
import { T } from '@/components/text';
import { Fonts, Radius, Space, usePalette } from '@/constants/theme';
import { track } from '@/lib/analytics';
import { getChapter } from '@/lib/bible';
import { success } from '@/lib/haptics';
import { PRAYER_MAX, type Prayer } from '@/lib/personal';
import { useSettings } from '@/lib/settings';

const fecha = (t: number) => new Date(t).toLocaleDateString('es', { day: 'numeric', month: 'short' });

/** Diario de oración: pedidos con fecha; se marcan como respondidos. Queda en el teléfono. */
export default function Oracion() {
  const c = usePalette();
  const { prayers, addPrayer, togglePrayer, removePrayer } = useSettings();
  const [text, setText] = useState('');
  const [tab, setTab] = useState<'abiertas' | 'respondidas'>('abiertas');
  const open = prayers.filter((p) => !p.answered);
  const answered = prayers.filter((p) => p.answered);
  const list = tab === 'abiertas' ? open : answered;

  function add() {
    if (!text.trim()) return;
    addPrayer(text);
    setText('');
    setTab('abiertas');
    track('oracion_agregada');
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <T variant="title">
          Diario{' '}
          <T variant="title" style={{ color: c.muted }}>
            de oración
          </T>
        </T>
        <T variant="muted" style={{ marginTop: Space.sm, fontSize: 16 }}>
          “{getChapter('php', 4)![5]}” Filipenses 4:6
        </T>

        <View style={[styles.composer, { backgroundColor: c.surface }]}>
          <TextInput
            value={text}
            onChangeText={(t) => setText(t.slice(0, PRAYER_MAX))}
            placeholder="¿Por qué querés orar hoy?"
            placeholderTextColor={c.muted}
            multiline
            accessibilityLabel="Nuevo pedido de oración"
            style={[styles.input, { color: c.text }]}
          />
          <Touchable
            accessibilityRole="button"
            disabled={!text.trim()}
            onPress={add}
            style={({ pressed }) => [
              styles.add,
              { backgroundColor: c.fill, opacity: !text.trim() ? 0.4 : pressed ? 0.85 : 1 },
            ]}>
            <T style={{ color: c.fillInk, fontFamily: Fonts.uiBold }}>Agregar</T>
          </Touchable>
        </View>

        <View style={styles.tabs}>
          {(['abiertas', 'respondidas'] as const).map((t) => (
            <Touchable
              key={t}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === t }}
              onPress={() => setTab(t)}
              style={[styles.tab, { borderBottomColor: tab === t ? c.text : 'transparent' }]}>
              <T style={{ fontFamily: Fonts.uiBold, color: tab === t ? c.text : c.muted }}>
                {t === 'abiertas' ? `Orando (${open.length})` : `Respondidas (${answered.length})`}
              </T>
            </Touchable>
          ))}
        </View>

        {list.length === 0 ? (
          <T variant="muted" style={{ marginTop: Space.lg, textAlign: 'center' }}>
            {tab === 'abiertas'
              ? 'Escribí tu primer pedido. Volvé a mirarlo cada día.'
              : 'Cuando Dios responda, marcalo y queda acá como recuerdo.'}
          </T>
        ) : (
          list.map((p) => (
            <PrayerRow
              key={p.id}
              prayer={p}
              onToggle={() => {
                if (!p.answered) {
                  success();
                  track('oracion_respondida');
                }
                togglePrayer(p.id);
              }}
              onRemove={() => removePrayer(p.id)}
            />
          ))
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function PrayerRow({
  prayer: p,
  onToggle,
  onRemove,
}: {
  prayer: Prayer;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const c = usePalette();
  return (
    <View style={[styles.row, { borderColor: c.line }]}>
      <Touchable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: !!p.answered }}
        accessibilityLabel="Respondida"
        hitSlop={8}
        onPress={onToggle}>
        <IconCheck color={p.answered ? c.fill : c.muted} filled={!!p.answered} size={26} />
      </Touchable>
      <View style={{ flex: 1 }}>
        <T style={{ fontSize: 16, lineHeight: 23 }}>{p.text}</T>
        <T variant="muted" style={{ fontSize: 13, marginTop: 2 }}>
          {fecha(p.at)}
          {p.answered ? ` · Respondida el ${fecha(p.answered)}` : ''}
        </T>
      </View>
      <Touchable accessibilityRole="button" accessibilityLabel="Borrar" hitSlop={10} onPress={onRemove}>
        <T style={{ color: c.muted, fontSize: 20 }}>×</T>
      </Touchable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { padding: Space.lg, paddingBottom: Space.xxl, maxWidth: 720, width: '100%', alignSelf: 'center' },
  composer: { marginTop: Space.lg, borderRadius: Radius.md, padding: Space.md, gap: Space.sm },
  input: { fontFamily: Fonts.ui, fontSize: 16, minHeight: 60, maxHeight: 140, textAlignVertical: 'top' },
  add: { alignSelf: 'flex-end', borderRadius: Radius.pill, paddingHorizontal: Space.lg, paddingVertical: 10 },
  tabs: { flexDirection: 'row', gap: Space.lg, marginTop: Space.xl },
  tab: { paddingBottom: 8, borderBottomWidth: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Space.md,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
