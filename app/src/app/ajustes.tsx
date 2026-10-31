import type { ReactNode } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';

import { EmailCapture } from '@/components/email-capture';
import { PressLink, Touchable } from '@/components/press-link';
import { T } from '@/components/text';
import { SITE_URL } from '@/constants/config';
import { Fonts, Radius, Space, usePalette } from '@/constants/theme';
import { track } from '@/lib/analytics';
import { REMINDER_TIMES, timeLabel, type Reminder } from '@/lib/personal';
import { usePlus } from '@/lib/plus';
import { remindersSupported, scheduleReminder } from '@/lib/reminder';
import { THEMES, type ThemePref } from '@/lib/scheme';
import { FONT_SIZES, useSettings } from '@/lib/settings';

const THEME_LABEL: Record<ThemePref, string> = { system: 'Automático', light: 'Claro', dark: 'Oscuro' };

export default function Ajustes() {
  const c = usePalette();
  const { theme, setTheme, fontStep, changeFont, fontSize, reminder, setReminder } = useSettings();
  const { isPlus } = usePlus();

  async function chooseReminder(r: Reminder) {
    const ok = await scheduleReminder(r);
    if (!ok && r) return; // sin permiso: queda como estaba
    setReminder(r);
    track(r ? 'recordatorio_activado' : 'recordatorio_desactivado', r ? { hora: timeLabel(r) } : {});
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <T variant="title">Ajustes</T>

      <Section title="Apariencia">
        <Segmented
          options={THEMES.map((t) => ({ value: t, label: THEME_LABEL[t] }))}
          value={theme}
          onChange={(t) => {
            setTheme(t);
            track('tema_cambiado', { tema: t });
          }}
        />
        <T variant="muted" style={{ marginTop: Space.sm }}>
          Automático sigue el modo claro u oscuro de tu teléfono.
        </T>
      </Section>

      <Section title="Tamaño de letra">
        <View style={styles.fontRow}>
          <Touchable
            accessibilityRole="button"
            accessibilityLabel="Achicar letra"
            disabled={fontStep === 0}
            onPress={() => changeFont(-1)}
            style={[styles.fontBtn, { backgroundColor: c.surface, opacity: fontStep === 0 ? 0.4 : 1 }]}>
            <T style={{ fontFamily: Fonts.uiBold, fontSize: 15 }}>A−</T>
          </Touchable>
          <T
            style={{
              flex: 1,
              fontFamily: Fonts.read,
              fontSize,
              lineHeight: fontSize * 1.6,
              textAlign: 'center',
            }}>
            En el principio era el Verbo
          </T>
          <Touchable
            accessibilityRole="button"
            accessibilityLabel="Agrandar letra"
            disabled={fontStep === FONT_SIZES.length - 1}
            onPress={() => changeFont(1)}
            style={[
              styles.fontBtn,
              { backgroundColor: c.surface, opacity: fontStep === FONT_SIZES.length - 1 ? 0.4 : 1 },
            ]}>
            <T style={{ fontFamily: Fonts.uiBold, fontSize: 19 }}>A+</T>
          </Touchable>
        </View>
      </Section>

      <Section title="Recordatorio diario">
        {remindersSupported ? (
          <>
            <T variant="muted">Un aviso a la hora que elijas para tu momento con Dios.</T>
            <View style={styles.chips}>
              <Chip label="No" selected={!reminder} onPress={() => chooseReminder(null)} />
              {REMINDER_TIMES.map((r) => (
                <Chip
                  key={timeLabel(r)}
                  label={timeLabel(r)}
                  selected={reminder?.hour === r.hour && reminder.minute === r.minute}
                  onPress={() => chooseReminder({ hour: r.hour, minute: r.minute })}
                />
              ))}
            </View>
          </>
        ) : (
          <T variant="muted">Los recordatorios funcionan en la app del teléfono.</T>
        )}
      </Section>

      <Section title="Devocional por email">
        <EmailCapture origen="ajustes" />
      </Section>

      <Section title="Bereano Plus">
        <PressLink
          href="/plus"
          style={({ pressed }) => [styles.row, { backgroundColor: c.surface, opacity: pressed ? 0.7 : 1 }]}>
          <T style={{ fontFamily: Fonts.uiBold, fontSize: 16 }}>
            {isPlus ? 'Tu suscripción' : 'Conocer Plus'}
          </T>
          <T variant="muted">{isPlus ? 'Activa' : '7 días gratis'}</T>
        </PressLink>
      </Section>

      <Section title="Más">
        <View style={{ gap: Space.sm }}>
          {[
            { label: 'Términos de uso', url: `${SITE_URL}/terminos` },
            { label: 'Política de privacidad', url: `${SITE_URL}/privacidad` },
          ].map((l) => (
            <Touchable
              key={l.url}
              accessibilityRole="link"
              onPress={() => Linking.openURL(l.url)}
              style={({ pressed }) => [
                styles.row,
                { backgroundColor: c.surface, opacity: pressed ? 0.7 : 1 },
              ]}>
              <T style={{ fontSize: 16 }}>{l.label}</T>
              <T style={{ color: c.muted }}>↗</T>
            </Touchable>
          ))}
        </View>
        <T variant="muted" style={{ marginTop: Space.md, fontSize: 13 }}>
          Bereano · Reina-Valera 1909 (dominio público). Tus notas, oraciones y resaltados quedan solo en este
          teléfono.
        </T>
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ marginTop: Space.xl }}>
      <T variant="label" style={{ marginBottom: Space.sm }}>
        {title}
      </T>
      {children}
    </View>
  );
}

function Segmented<V extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: V; label: string }[];
  value: V;
  onChange: (v: V) => void;
}) {
  const c = usePalette();
  return (
    <View style={[styles.segment, { backgroundColor: c.surface }]} accessibilityRole="radiogroup">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Touchable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            style={[
              styles.segmentItem,
              on && { backgroundColor: c.bg, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
            ]}>
            <T
              style={{
                fontFamily: on ? Fonts.uiBold : Fonts.uiSemi,
                fontSize: 15,
                color: on ? c.text : c.muted,
              }}>
              {o.label}
            </T>
          </Touchable>
        );
      })}
    </View>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const c = usePalette();
  return (
    <Touchable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: selected ? c.fill : c.surface, opacity: pressed ? 0.8 : 1 },
      ]}>
      <T style={{ fontFamily: Fonts.uiBold, fontSize: 15, color: selected ? c.fillInk : c.text }}>{label}</T>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  page: { padding: Space.lg, paddingBottom: Space.xxl, maxWidth: 720, width: '100%', alignSelf: 'center' },
  segment: { flexDirection: 'row', borderRadius: Radius.sm, padding: 3 },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 10 },
  fontRow: { flexDirection: 'row', alignItems: 'center', gap: Space.md },
  fontBtn: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm, marginTop: Space.md },
  chip: { borderRadius: Radius.pill, paddingHorizontal: 16, paddingVertical: 10 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Space.md,
    borderRadius: Radius.sm,
  },
});
