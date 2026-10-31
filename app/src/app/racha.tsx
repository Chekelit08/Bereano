import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { IconChevron, IconFlame } from '@/components/icons';
import { Touchable } from '@/components/press-link';
import { T } from '@/components/text';
import { Fonts, Radius, Space, usePalette } from '@/constants/theme';
import { MILESTONES, bestStreak, dayKey, streak } from '@/lib/dias';
import { useSettings } from '@/lib/settings';

const WEEK = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

/** Racha: días seguidos, la mejor racha, el calendario del mes y los hitos. */
export default function Racha() {
  const c = usePalette();
  const { days } = useSettings();
  const [offset, setOffset] = useState(0);
  const now = new Date();
  const current = streak(days, now);
  const best = bestStreak(days);
  const total = Object.values(days).filter((d) => Object.keys(d).length > 0).length;

  const month = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const lead = (month.getDay() + 6) % 7; // lunes primero
  const cells = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const todayKey = dayKey(now);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={[styles.hero, { backgroundColor: c.fill }]}>
        <IconFlame color={c.fillInk} size={34} />
        <T style={{ color: c.fillInk, fontFamily: Fonts.display, fontSize: 56, lineHeight: 62 }}>{current}</T>
        <T style={{ color: c.fillInk, fontFamily: Fonts.uiBold, fontSize: 17 }}>
          {current === 1 ? 'día seguido' : 'días seguidos'}
        </T>
      </View>

      <View style={styles.stats}>
        <Stat label="Mejor racha" value={best} />
        <Stat label="Días con Dios" value={total} />
      </View>

      <View style={[styles.calendar, { backgroundColor: c.surface }]}>
        <View style={styles.monthRow}>
          <Touchable
            accessibilityRole="button"
            accessibilityLabel="Mes anterior"
            hitSlop={10}
            onPress={() => setOffset((o) => o - 1)}>
            <View style={{ transform: [{ rotate: '180deg' }] }}>
              <IconChevron color={c.accent} />
            </View>
          </Touchable>
          <T style={{ fontFamily: Fonts.uiBold, fontSize: 17 }}>{monthLabel(month)}</T>
          <Touchable
            accessibilityRole="button"
            accessibilityLabel="Mes siguiente"
            hitSlop={10}
            disabled={offset >= 0}
            onPress={() => setOffset((o) => Math.min(0, o + 1))}
            style={{ opacity: offset >= 0 ? 0.3 : 1 }}>
            <IconChevron color={c.accent} />
          </Touchable>
        </View>
        <View style={styles.grid}>
          {WEEK.map((w, i) => (
            <T key={i} variant="label" style={styles.cellHead}>
              {w}
            </T>
          ))}
          {cells.map((d, i) => {
            if (!d) return <View key={i} style={styles.cell} />;
            const k = dayKey(new Date(month.getFullYear(), month.getMonth(), d));
            const done = !!days[k] && Object.keys(days[k]).length > 0;
            const isToday = k === todayKey;
            return (
              <View key={i} style={styles.cell}>
                <View
                  style={[
                    styles.dot,
                    done && { backgroundColor: c.fill },
                    isToday && !done && { borderWidth: 1.5, borderColor: c.fill },
                  ]}>
                  <T style={{ fontFamily: Fonts.uiSemi, fontSize: 14, color: done ? c.fillInk : c.text }}>
                    {d}
                  </T>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <T variant="heading" style={{ marginTop: Space.xl }}>
        Hitos
      </T>
      <View style={styles.badges}>
        {MILESTONES.map((m) => {
          const got = best >= m;
          return (
            <View key={m} style={[styles.badge, { backgroundColor: got ? c.fill : c.surface }]}>
              <T style={{ fontFamily: Fonts.display, fontSize: 24, color: got ? c.fillInk : c.muted }}>{m}</T>
              <T style={{ fontSize: 12, color: got ? c.fillInk : c.muted }}>días</T>
            </View>
          );
        })}
      </View>
      <T variant="muted" style={{ marginTop: Space.md }}>
        Cuenta un día cuando leés el devocional, un capítulo o le preguntás al compañero.
      </T>
    </ScrollView>
  );
}

/** "Octubre de 2026". */
function monthLabel(d: Date) {
  const s = d.toLocaleDateString('es', { month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function Stat({ label, value }: { label: string; value: number }) {
  const c = usePalette();
  return (
    <View style={[styles.stat, { backgroundColor: c.surface }]}>
      <T style={{ fontFamily: Fonts.display, fontSize: 28 }}>{value}</T>
      <T variant="muted">{label}</T>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { padding: Space.lg, paddingBottom: Space.xxl, maxWidth: 720, width: '100%', alignSelf: 'center' },
  hero: { borderRadius: Radius.lg, padding: Space.xl, alignItems: 'center' },
  stats: { flexDirection: 'row', gap: Space.sm, marginTop: Space.md },
  stat: { flex: 1, borderRadius: Radius.md, padding: Space.md },
  calendar: { marginTop: Space.lg, borderRadius: Radius.md, padding: Space.md },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Space.sm,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cellHead: { width: `${100 / 7}%`, textAlign: 'center', paddingVertical: 6 },
  cell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 3 },
  dot: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm, marginTop: Space.md },
  badge: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
});
