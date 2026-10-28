import { useRouter, type Href } from 'expo-router';
import { useState, type ComponentType } from 'react';
import { ScrollView, StyleSheet, useColorScheme, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconBook, IconChat, IconCheck, IconChevron, IconFlame, IconSun } from '@/components/icons';
import { PressLink, Touchable } from '@/components/press-link';
import { GREETING, momentOf, Textura } from '@/components/textura';
import { T } from '@/components/text';
import { VersiculoDelDia } from '@/components/versiculo-del-dia';
import { Fonts, Radius, Space, usePalette } from '@/constants/theme';
import { devocionalDelDia, getDevocional, shareRange, shareText } from '@/data/devocionales';
import { dayKey, streak } from '@/lib/dias';
import { formatRef, getBook, getChapter } from '@/lib/bible';
import { useSettings } from '@/lib/settings';

type Step = {
  key: 'devo' | 'chat' | 'read';
  title: string;
  detail: string;
  href: Href;
  Icon: ComponentType<{ color: string; size?: number }>;
};

export default function Hoy() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const dark = useColorScheme() === 'dark';
  const router = useRouter();
  const { saved, days, lastRead } = useSettings();
  const [now] = useState(() => new Date());
  const moment = momentOf(now);
  const today = devocionalDelDia(now);
  const done = days[dayKey(now)] ?? {};
  const racha = streak(days, now);

  const [a, b] = shareRange(today);
  const verse = shareText(getChapter(today.book, today.chapter)!.slice(a - 1, b));
  const verseRef = formatRef(getBook(today.book)!, today.chapter, a, b);
  const last = lastRead && getBook(lastRead.book);

  const steps: Step[] = [
    {
      key: 'devo',
      title: 'Devocional',
      detail: `${today.title} · 3 min`,
      href: { pathname: '/devocional/[id]', params: { id: today.id } },
      Icon: IconSun,
    },
    {
      key: 'chat',
      title: 'Preguntale al compañero',
      detail: 'Una duda sobre el pasaje de hoy',
      href: '/companero',
      Icon: IconChat,
    },
    {
      key: 'read',
      title: last ? 'Seguir leyendo' : 'Leer un capítulo',
      detail: last ? `${last.name} ${lastRead.chapter}` : 'Empezá por el Evangelio de Juan',
      href: last
        ? { pathname: '/[book]/[chapter]', params: { book: last.code, chapter: lastRead.chapter } }
        : { pathname: '/[book]/[chapter]', params: { book: 'jhn', chapter: 1 } },
      Icon: IconBook,
    },
  ];
  const completed = steps.filter((s) => done[s.key]).length;
  const savedList = saved.map(getDevocional).filter((d) => d && d.id !== today.id);

  return (
    <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={{ paddingBottom: Space.xl }}>
      <View style={[styles.header, { paddingTop: insets.top + Space.lg }]}>
        <View style={styles.headerTop}>
          <T variant="label">
            {now.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
          </T>
          {racha > 0 && (
            <View style={[styles.streak, { backgroundColor: c.fill }]}>
              <IconFlame color={c.accent} />
              <T style={{ fontFamily: Fonts.uiBold, fontSize: 13, color: c.fillInk }}>
                {racha} {racha === 1 ? 'día' : 'días'}
              </T>
            </View>
          )}
        </View>
        <Animated.View entering={FadeInDown.duration(500)}>
          <T variant="title" style={{ marginTop: Space.sm }}>
            {GREETING[moment]}
          </T>
        </Animated.View>

        {/* Versículo del día sobre una textura suave */}
        <Animated.View
          entering={FadeInDown.delay(120).duration(600)}
          style={[styles.verseCard, { borderColor: c.line }]}>
          <Textura dark={dark} base={c.surface} />
          <T variant="label" style={{ color: c.accent }}>
            Versículo del día
          </T>
          <T style={[styles.verse, { color: c.text }]}>{verse}</T>
          <T style={[styles.verseRef, { color: c.muted }]}>{verseRef}</T>
        </Animated.View>
      </View>

      <View style={[styles.sheet, { backgroundColor: c.bg }]}>
        <View style={styles.rowBetween}>
          <T variant="heading" style={{ fontSize: 20 }}>
            Tu momento de hoy
          </T>
          <T variant="muted" style={{ fontFamily: Fonts.uiBold }}>
            {completed} de {steps.length}
          </T>
        </View>
        <View style={[styles.progress, { backgroundColor: c.surface2 }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: c.fill, width: `${(completed / steps.length) * 100}%` },
            ]}
          />
        </View>

        {steps.map((s, i) => {
          const isDone = !!done[s.key];
          return (
            <Animated.View key={s.key} entering={FadeInDown.delay(250 + i * 90).duration(500)}>
              <Touchable
                accessibilityRole="button"
                accessibilityLabel={`${s.title}${isDone ? ', hecho' : ''}`}
                onPress={() => router.push(s.href)}
                style={({ pressed }) => [
                  styles.step,
                  {
                    backgroundColor: c.surface,
                    borderColor: c.line,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ]}>
                <View style={[styles.stepIcon, { backgroundColor: isDone ? c.fill : c.surface2 }]}>
                  {isDone ? (
                    <IconCheck color={c.fill} filled size={26} />
                  ) : (
                    <s.Icon color={c.text} size={22} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <T style={{ fontFamily: Fonts.uiBold, fontSize: 16 }}>{s.title}</T>
                  <T variant="muted" numberOfLines={1}>
                    {s.detail}
                  </T>
                </View>
                <IconChevron color={c.muted} />
              </Touchable>
            </Animated.View>
          );
        })}

        <View style={styles.section}>
          <T variant="heading" style={{ fontSize: 20 }}>
            Para tus historias
          </T>
          <T variant="muted" style={{ marginBottom: Space.md }}>
            El versículo de hoy en cuatro diseños. Deslizá y compartí.
          </T>
          <VersiculoDelDia devocional={today} />
        </View>

        {savedList.length > 0 && (
          <View style={styles.section}>
            <T variant="heading" style={{ fontSize: 20, marginBottom: Space.sm }}>
              Guardados
            </T>
            {savedList.map(
              (d) =>
                d && (
                  <PressLink
                    key={d.id}
                    href={{ pathname: '/devocional/[id]', params: { id: d.id } }}
                    style={({ pressed }) => [
                      styles.saved,
                      { borderColor: c.line, opacity: pressed ? 0.6 : 1 },
                    ]}>
                    <T style={{ fontFamily: Fonts.display, fontSize: 24 }}>{d.title}</T>
                    <T variant="muted">{formatRef(getBook(d.book)!, d.chapter, d.from, d.to)}</T>
                  </PressLink>
                ),
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Space.lg },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 30 },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  verseCard: {
    marginTop: Space.lg,
    padding: Space.lg,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  verse: { fontFamily: Fonts.readItalic, fontSize: 21, lineHeight: 32, marginTop: Space.sm },
  verseRef: { fontFamily: Fonts.uiBold, fontSize: 13, marginTop: Space.md },
  sheet: { paddingHorizontal: Space.lg, paddingTop: Space.xl },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  progress: { height: 6, borderRadius: 3, marginTop: Space.sm, marginBottom: Space.md, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    padding: Space.md,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: Space.sm,
  },
  stepIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  section: { marginTop: Space.xl },
  saved: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
});
