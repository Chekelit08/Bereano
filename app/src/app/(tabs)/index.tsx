import { useRouter, type Href } from 'expo-router';
import { useState, type ComponentType } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PlanCard } from '@/components/plan-card';
import { EmailCapture } from '@/components/email-capture';
import {
  IconBook,
  IconChat,
  IconCheck,
  IconChevron,
  IconFlame,
  IconGear,
  IconPen,
  IconPray,
  IconSun,
} from '@/components/icons';
import { PressLink, Touchable } from '@/components/press-link';
import { GREETING, momentOf } from '@/components/momento';
import { T } from '@/components/text';
import { VersiculoDelDia } from '@/components/versiculo-del-dia';
import { Fonts, Radius, Space, usePalette } from '@/constants/theme';
import { PLANES } from '@/data/planes';
import { devocionalDelDia, getDevocional, shareRange, shareText } from '@/data/devocionales';
import { dayKey, streak } from '@/lib/dias';
import { planProgress } from '@/lib/planes';
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
  const router = useRouter();
  const { saved, days, lastRead, plans, name, prayers, highlights, emailJoined } = useSettings();
  const openPrayers = prayers.filter((p) => !p.answered).length;
  const marks = Object.keys(highlights).length;
  const [now] = useState(() => new Date());
  const moment = momentOf(now);
  const today = devocionalDelDia(now);
  const done = days[dayKey(now)] ?? {};
  const racha = streak(days, now);

  const [a, b] = shareRange(today);
  const verse = shareText(getChapter(today.book, today.chapter)!.slice(a - 1, b));
  const verseRef = formatRef(getBook(today.book)!, today.chapter, a, b);
  const last = lastRead && getBook(lastRead.book);

  // El primer plan en curso (sin terminar), si hay.
  const activePlan = PLANES.map((plan) => ({ plan, ...planProgress(plan, plans[plan.id]) })).find(
    (p) => p.started && !p.finished,
  );

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
    activePlan
      ? {
          key: 'read',
          title: `Plan: ${activePlan.plan.title}`,
          detail: `Día ${activePlan.next + 1} de ${activePlan.total} · ${activePlan.plan.days[activePlan.next].title}`,
          href: {
            pathname: '/planes/[id]/[dia]',
            params: { id: activePlan.plan.id, dia: activePlan.next + 1 },
          },
          Icon: IconBook,
        }
      : {
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
    <ScrollView
      style={{ backgroundColor: c.bg }}
      contentContainerStyle={{ paddingBottom: Space.xl, maxWidth: 720, width: '100%', alignSelf: 'center' }}>
      <View style={[styles.header, { paddingTop: insets.top + Space.lg }]}>
        <View style={styles.headerTop}>
          <T variant="label">
            {now.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
          </T>
          <View style={styles.headerActions}>
            <PressLink
              href="/racha"
              accessibilityLabel={`Racha: ${racha} ${racha === 1 ? 'día' : 'días'}`}
              style={({ pressed }) => [
                styles.streak,
                { backgroundColor: racha > 0 ? c.fill : c.surface, opacity: pressed ? 0.8 : 1 },
              ]}>
              <IconFlame color={racha > 0 ? c.fillInk : c.muted} />
              <T style={{ fontFamily: Fonts.uiBold, fontSize: 13, color: racha > 0 ? c.fillInk : c.muted }}>
                {racha} {racha === 1 ? 'día' : 'días'}
              </T>
            </PressLink>
            <PressLink
              href="/ajustes"
              accessibilityLabel="Ajustes"
              hitSlop={8}
              style={({ pressed }) => [
                styles.gear,
                { backgroundColor: c.surface, opacity: pressed ? 0.7 : 1 },
              ]}>
              <IconGear color={c.text} size={20} />
            </PressLink>
          </View>
        </View>
        <Animated.View entering={FadeInDown.duration(500)}>
          <T variant="title" style={{ marginTop: Space.sm }}>
            {GREETING[moment]}
            {name ? `, ${name}` : ''}
          </T>
        </Animated.View>

        {/* Versículo del día sobre una textura suave */}
        <Animated.View
          entering={FadeInDown.delay(120).duration(600)}
          style={[styles.verseCard, { backgroundColor: c.surface }]}>
          <T variant="label">Versículo del día</T>
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
          <View style={styles.rowBetween}>
            <T variant="heading" style={{ fontSize: 20 }}>
              Planes de lectura
            </T>
            <PressLink href="/planes" style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
              <T style={{ fontFamily: Fonts.uiBold, fontSize: 15, color: c.accent }}>Ver todos</T>
            </PressLink>
          </View>
          <View style={{ marginTop: Space.sm }}>
            <PlanCard plan={activePlan?.plan ?? PLANES.find((p) => p.id === 'juan')!} />
          </View>
        </View>

        <View style={styles.section}>
          <T variant="heading" style={{ fontSize: 20, marginBottom: Space.sm }}>
            Tu espacio
          </T>
          <View style={styles.tiles}>
            <Tile
              href="/oracion"
              Icon={IconPray}
              title="Oración"
              detail={
                openPrayers ? `${openPrayers} ${openPrayers === 1 ? 'pedido' : 'pedidos'}` : 'Tu diario'
              }
            />
            <Tile
              href="/resaltados"
              Icon={IconPen}
              title="Resaltados"
              detail={marks ? `${marks} ${marks === 1 ? 'versículo' : 'versículos'}` : 'Y tus notas'}
            />
          </View>
        </View>

        {!emailJoined && (
          <View style={styles.section}>
            <EmailCapture origen="hoy" />
          </View>
        )}

        <View style={styles.section}>
          <T variant="heading" style={{ fontSize: 20 }}>
            Para tus historias
          </T>
          <T variant="muted" style={{ marginBottom: Space.md }}>
            Tres diseños nuevos cada día. Deslizá y compartí.
          </T>
          <VersiculoDelDia devocional={today} date={now} />
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

function Tile({
  href,
  Icon,
  title,
  detail,
}: {
  href: Href;
  Icon: ComponentType<{ color: string; size?: number }>;
  title: string;
  detail: string;
}) {
  const c = usePalette();
  return (
    <PressLink
      href={href}
      style={({ pressed }) => [styles.tile, { backgroundColor: pressed ? c.surface2 : c.surface }]}>
      <Icon color={c.accent} size={24} />
      <T style={{ fontFamily: Fonts.uiBold, fontSize: 16, marginTop: Space.sm }}>{title}</T>
      <T variant="muted">{detail}</T>
    </PressLink>
  );
}

const styles = StyleSheet.create({
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  gear: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  tiles: { flexDirection: 'row', gap: Space.sm },
  tile: { flex: 1, borderRadius: Radius.md, padding: Space.md },
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
    overflow: 'hidden',
  },
  verse: { fontFamily: Fonts.read, fontSize: 20, lineHeight: 31, marginTop: Space.sm },
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
    marginBottom: Space.sm,
  },
  stepIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  section: { marginTop: Space.xl },
  saved: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
});
