import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View, type ScrollViewInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NotFound } from '@/components/not-found';
import { PressLink, Touchable } from '@/components/press-link';
import { T } from '@/components/text';
import { Fonts, Space, usePalette } from '@/constants/theme';
import { formatRef, getBook, getChapter, neighbors, type Book } from '@/lib/bible';
import { track } from '@/lib/analytics';
import { MAX_SHARE_VERSES } from '@/lib/compartir';
import { HIGHLIGHT_COLORS, HIGHLIGHT_HEX, NOTE_MAX, verseKey } from '@/lib/personal';
import { FONT_SIZES, useSettings } from '@/lib/settings';

export default function Reader() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ book: string; chapter: string; v?: string }>();
  const book = getBook(params.book);
  const chapter = Number(params.chapter);
  const verses = book && Number.isInteger(chapter) ? getChapter(book.code, chapter) : undefined;
  const target = Number(params.v) || 0;

  const { fontSize, fontStep, changeFont, setLastRead, markDay, highlights, setHighlight, setNote } =
    useSettings();
  const [noteDraft, setNoteDraft] = useState<string | null>(null);
  const scroll = useRef<ScrollViewInstance>(null);
  const router = useRouter();
  // Versículos elegidos para compartir: un rango seguido.
  const [sel, setSel] = useState<{ from: number; to: number } | null>(null);

  useEffect(() => {
    if (book && verses) setLastRead({ book: book.code, chapter });
    if (book && verses) markDay('read');
  }, [book, chapter, verses, setLastRead, markDay]);

  if (!book || !verses) return <NotFound />;

  const { prev, next } = neighbors(book, chapter);

  function toggle(n: number) {
    setSel((s) => {
      if (!s) return { from: n, to: n };
      if (n >= s.from && n <= s.to)
        return s.from === s.to
          ? null
          : n === s.to
            ? { ...s, to: n - 1 }
            : n === s.from
              ? { ...s, from: n + 1 }
              : { from: n, to: n };
      if (n === s.to + 1 && n - s.from < MAX_SHARE_VERSES) return { ...s, to: n };
      if (n === s.from - 1 && s.to - n < MAX_SHARE_VERSES) return { ...s, from: n };
      return { from: n, to: n };
    });
  }
  const lineHeight = Math.round(fontSize * 1.8);

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
        contentContainerStyle={[styles.page, { paddingBottom: insets.bottom + (sel ? 240 : Space.xl) }]}>
        <T variant="label">{book.name}</T>
        <T style={[styles.chapterNum, { color: c.text }]}>{chapter}</T>

        {verses.map((text, i) => {
          const n = i + 1;
          const highlighted = n === target;
          const selected = !!sel && n >= sel.from && n <= sel.to;
          const mark = highlights[verseKey(book.code, chapter, n)];
          return (
            <Touchable
              key={n}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityHint="Elegir para resaltar, anotar o compartir"
              onPress={() => {
                setNoteDraft(null);
                toggle(n);
              }}
              onLayout={
                highlighted
                  ? (e) =>
                      scroll.current?.scrollTo({
                        y: Math.max(0, e.nativeEvent.layout.y - Space.xl),
                        animated: false,
                      })
                  : undefined
              }
              style={[
                styles.verse,
                highlighted && { backgroundColor: c.surface, borderColor: c.accent },
                mark && { backgroundColor: `${HIGHLIGHT_HEX[mark.c]}4D` },
                selected && {
                  borderColor: c.fill,
                  backgroundColor: mark ? `${HIGHLIGHT_HEX[mark.c]}4D` : c.surface2,
                },
              ]}>
              <T style={{ fontFamily: Fonts.read, fontSize, lineHeight }}>
                <T style={[styles.verseNum, { color: c.muted, fontSize: Math.round(fontSize * 0.6) }]}>
                  {n}{' '}
                </T>
                {text}
              </T>
              {mark?.n && (
                <T style={[styles.note, { color: c.muted, borderColor: HIGHLIGHT_HEX[mark.c] }]}>{mark.n}</T>
              )}
            </Touchable>
          );
        })}

        <View style={[styles.nav, { borderColor: c.line }]}>
          <NavLink to={prev} label="Anterior" align="left" />
          <NavLink to={next} label="Siguiente" align="right" />
        </View>
      </ScrollView>

      {sel && (
        <View style={[styles.shareBar, { bottom: insets.bottom + Space.md }]}>
          <View style={[styles.sheet, { backgroundColor: c.bg, borderColor: c.line, shadowColor: '#000' }]}>
            <View style={styles.sheetHead}>
              <T style={{ flex: 1, fontFamily: Fonts.uiBold, fontSize: 15 }} numberOfLines={1}>
                {formatRef(book, chapter, sel.from, sel.to)}
              </T>
              <Touchable
                accessibilityRole="button"
                accessibilityLabel="Cerrar"
                hitSlop={10}
                onPress={() => {
                  setSel(null);
                  setNoteDraft(null);
                }}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, paddingHorizontal: 4 })}>
                <T style={{ color: c.muted, fontSize: 22 }}>×</T>
              </Touchable>
            </View>

            {noteDraft === null ? (
              <>
                <View style={styles.colors}>
                  {HIGHLIGHT_COLORS.map((color) => {
                    const keys = selKeys(book.code, chapter, sel);
                    const active = keys.every((k) => highlights[k]?.c === color);
                    return (
                      <Touchable
                        key={color}
                        accessibilityRole="button"
                        accessibilityLabel={`Resaltar en ${color}`}
                        accessibilityState={{ selected: active }}
                        onPress={() => {
                          setHighlight(keys, active ? null : color);
                          if (!active) track('resaltado', { color });
                        }}
                        style={[
                          styles.color,
                          { backgroundColor: HIGHLIGHT_HEX[color] },
                          active && { borderWidth: 3, borderColor: c.text },
                        ]}
                      />
                    );
                  })}
                  {selKeys(book.code, chapter, sel).some((k) => highlights[k]) && (
                    <Touchable
                      accessibilityRole="button"
                      accessibilityLabel="Quitar resaltado"
                      onPress={() => setHighlight(selKeys(book.code, chapter, sel), null)}
                      style={[styles.color, styles.clear, { borderColor: c.muted }]}>
                      <T style={{ color: c.muted, fontSize: 16 }}>⌀</T>
                    </Touchable>
                  )}
                </View>
                <View style={styles.actions}>
                  <Touchable
                    accessibilityRole="button"
                    onPress={() => setNoteDraft(highlights[verseKey(book.code, chapter, sel.from)]?.n ?? '')}
                    style={({ pressed }) => [
                      styles.action,
                      { borderColor: c.text, opacity: pressed ? 0.7 : 1 },
                    ]}>
                    <T style={{ fontFamily: Fonts.uiBold, fontSize: 15 }}>
                      {highlights[verseKey(book.code, chapter, sel.from)]?.n ? 'Editar nota' : 'Nota'}
                    </T>
                  </Touchable>
                  <Touchable
                    accessibilityRole="button"
                    onPress={() =>
                      router.push({
                        pathname: '/compartir',
                        params: { book: book.code, chapter, from: sel.from, to: sel.to },
                      })
                    }
                    style={({ pressed }) => [
                      styles.action,
                      { backgroundColor: c.fill, borderColor: c.fill, opacity: pressed ? 0.85 : 1 },
                    ]}>
                    <T style={{ color: c.fillInk, fontFamily: Fonts.uiBold, fontSize: 15 }}>
                      Compartir imagen
                    </T>
                  </Touchable>
                </View>
              </>
            ) : (
              <View style={{ gap: Space.sm }}>
                <TextInput
                  value={noteDraft}
                  onChangeText={(t) => setNoteDraft(t.slice(0, NOTE_MAX))}
                  placeholder="¿Qué te dice este versículo?"
                  placeholderTextColor={c.muted}
                  multiline
                  autoFocus
                  accessibilityLabel="Nota"
                  style={[styles.noteInput, { color: c.text, backgroundColor: c.surface }]}
                />
                <View style={styles.actions}>
                  <Touchable
                    accessibilityRole="button"
                    onPress={() => setNoteDraft(null)}
                    style={({ pressed }) => [
                      styles.action,
                      { borderColor: c.text, opacity: pressed ? 0.7 : 1 },
                    ]}>
                    <T style={{ fontFamily: Fonts.uiBold, fontSize: 15 }}>Cancelar</T>
                  </Touchable>
                  <Touchable
                    accessibilityRole="button"
                    onPress={() => {
                      setNote(verseKey(book.code, chapter, sel.from), noteDraft);
                      if (noteDraft.trim()) track('nota_guardada');
                      setNoteDraft(null);
                    }}
                    style={({ pressed }) => [
                      styles.action,
                      { backgroundColor: c.fill, borderColor: c.fill, opacity: pressed ? 0.85 : 1 },
                    ]}>
                    <T style={{ color: c.fillInk, fontFamily: Fonts.uiBold, fontSize: 15 }}>Guardar nota</T>
                  </Touchable>
                </View>
              </View>
            )}
          </View>
        </View>
      )}
    </>
  );
}

function selKeys(book: string, chapter: number, sel: { from: number; to: number }) {
  return Array.from({ length: sel.to - sel.from + 1 }, (_, i) => verseKey(book, chapter, sel.from + i));
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
      <T style={{ fontFamily: Fonts.uiBold, fontSize: small ? 15 : 19, color: c.accent }}>{label}</T>
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
    paddingHorizontal: 28,
    paddingTop: Space.lg,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  chapterNum: {
    fontFamily: Fonts.display,
    fontSize: 96,
    lineHeight: 100,
    marginTop: Space.xs,
    marginBottom: Space.lg,
  },
  verse: {
    borderLeftWidth: 2,
    borderColor: 'transparent',
    paddingLeft: Space.sm,
    marginLeft: -Space.sm - 2,
    paddingVertical: 4,
    marginBottom: 10,
    borderRadius: 4,
  },
  verseNum: { fontFamily: Fonts.uiBold, letterSpacing: 0.5 },
  fontButtons: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  nav: {
    flexDirection: 'row',
    gap: Space.md,
    marginTop: Space.xl,
    paddingTop: Space.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  navItem: { flex: 1, paddingVertical: Space.sm },
  shareBar: { position: 'absolute', left: Space.md, right: Space.md, alignItems: 'center' },
  sheet: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Space.md,
    gap: Space.md,
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  sheetHead: { flexDirection: 'row', alignItems: 'center' },
  colors: { flexDirection: 'row', gap: Space.sm, alignItems: 'center' },
  color: { width: 36, height: 36, borderRadius: 18 },
  clear: { borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: Space.sm },
  action: { flex: 1, borderWidth: 1, borderRadius: 999, paddingVertical: 12, alignItems: 'center' },
  noteInput: {
    fontFamily: Fonts.ui,
    fontSize: 16,
    minHeight: 80,
    maxHeight: 160,
    borderRadius: 12,
    padding: Space.md,
    textAlignVertical: 'top',
  },
  note: {
    fontFamily: Fonts.readItalic,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
    paddingLeft: Space.sm,
    borderLeftWidth: 2,
  },
});
