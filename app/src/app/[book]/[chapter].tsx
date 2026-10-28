import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NotFound } from '@/components/not-found';
import { PressLink, Touchable } from '@/components/press-link';
import { T } from '@/components/text';
import { Fonts, Space, usePalette } from '@/constants/theme';
import { getBook, getChapter, neighbors, type Book } from '@/lib/bible';
import { FONT_SIZES, useSettings } from '@/lib/settings';

export default function Reader() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ book: string; chapter: string; v?: string }>();
  const book = getBook(params.book);
  const chapter = Number(params.chapter);
  const verses = book && Number.isInteger(chapter) ? getChapter(book.code, chapter) : undefined;
  const target = Number(params.v) || 0;

  const { fontSize, fontStep, changeFont, setLastRead } = useSettings();
  const scroll = useRef<ScrollViewInstance>(null);

  useEffect(() => {
    if (book && verses) setLastRead({ book: book.code, chapter });
  }, [book, chapter, verses, setLastRead]);

  if (!book || !verses) return <NotFound />;

  const { prev, next } = neighbors(book, chapter);
  const lineHeight = Math.round(fontSize * 1.65);

  return (
    <>
      <Stack.Screen
        options={{
          title: `${book.name} ${chapter}`,
          headerRight: () => (
            <View style={styles.fontButtons}>
              <FontButton
                label="A−"
                hint="Achicar letra"
                disabled={fontStep === 0}
                onPress={() => changeFont(-1)}
                small
              />
              <FontButton
                label="A+"
                hint="Agrandar letra"
                disabled={fontStep === FONT_SIZES.length - 1}
                onPress={() => changeFont(1)}
              />
            </View>
          ),
        }}
      />
      <ScrollView
        ref={scroll}
        contentContainerStyle={[styles.page, { paddingBottom: insets.bottom + Space.xl }]}>
        <T variant="label">{book.name}</T>
        <T style={[styles.chapterNum, { color: c.accent }]}>{chapter}</T>

        {verses.map((text, i) => {
          const n = i + 1;
          const highlighted = n === target;
          return (
            <View
              key={n}
              onLayout={
                highlighted
                  ? (e) =>
                      scroll.current?.scrollTo({
                        y: Math.max(0, e.nativeEvent.layout.y - Space.xl),
                        animated: false,
                      })
                  : undefined
              }
              style={[styles.verse, highlighted && { backgroundColor: c.surface, borderColor: c.accent }]}>
              <T style={{ fontSize, lineHeight }} selectable>
                <T style={[styles.verseNum, { color: c.accent, fontSize: fontSize * 0.62 }]}>{n} </T>
                {text}
              </T>
            </View>
          );
        })}

        <View style={[styles.nav, { borderColor: c.line }]}>
          <NavLink to={prev} label="Anterior" align="left" />
          <NavLink to={next} label="Siguiente" align="right" />
        </View>
      </ScrollView>
    </>
  );
}

function FontButton({
  label,
  hint,
  onPress,
  disabled,
  small,
}: {
  label: string;
  hint: string;
  onPress: () => void;
  disabled: boolean;
  small?: boolean;
}) {
  const c = usePalette();
  return (
    <Touchable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={hint}
      hitSlop={8}
      style={({ pressed }) => ({ opacity: disabled ? 0.3 : pressed ? 0.6 : 1, paddingHorizontal: 6 })}>
      <T style={{ fontFamily: Fonts.displayMedium, fontSize: small ? 15 : 19, color: c.accent }}>{label}</T>
    </Touchable>
  );
}

function NavLink({
  to,
  label,
  align,
}: {
  to: { book: Book; chapter: number } | null;
  label: string;
  align: 'left' | 'right';
}) {
  const c = usePalette();
  if (!to) return <View style={{ flex: 1 }} />;
  return (
    <PressLink
      href={{ pathname: '/[book]/[chapter]', params: { book: to.book.code, chapter: to.chapter } }}
      replace
      style={({ pressed }) => [
        styles.navItem,
        { alignItems: align === 'left' ? 'flex-start' : 'flex-end', opacity: pressed ? 0.6 : 1 },
      ]}>
      <T variant="label">{align === 'left' ? `← ${label}` : `${label} →`}</T>
      <T style={{ fontFamily: Fonts.display, fontSize: 18, color: c.text, marginTop: 2 }}>
        {to.book.name} {to.chapter}
      </T>
    </PressLink>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: Space.lg,
    paddingTop: Space.md,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  chapterNum: { fontFamily: Fonts.display, fontSize: 72, lineHeight: 80, marginBottom: Space.md },
  verse: {
    borderLeftWidth: 2,
    borderColor: 'transparent',
    paddingLeft: Space.sm,
    marginLeft: -Space.sm - 2,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verseNum: { fontFamily: Fonts.bodyMedium },
  fontButtons: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  nav: {
    flexDirection: 'row',
    gap: Space.md,
    marginTop: Space.xl,
    paddingTop: Space.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  navItem: { flex: 1, paddingVertical: Space.sm },
});
