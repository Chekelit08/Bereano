import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { PressLink, Touchable } from '@/components/press-link';
import { T } from '@/components/text';
import { Fonts, Radius, Space, usePalette } from '@/constants/theme';
import { formatRef, getBook, getChapter } from '@/lib/bible';
import { HIGHLIGHT_COLORS, HIGHLIGHT_HEX, parseVerseKey, type HighlightColor } from '@/lib/personal';
import { useSettings } from '@/lib/settings';

/** Mis resaltados y notas, del más nuevo al más viejo, con filtro por color. */
export default function Resaltados() {
  const c = usePalette();
  const { highlights } = useSettings();
  const [filter, setFilter] = useState<HighlightColor | 'notas' | null>(null);

  const items = Object.entries(highlights)
    .map(([k, h]) => ({ k, h, v: parseVerseKey(k) }))
    .filter((x) => x.v && getBook(x.v.book))
    .filter((x) => (filter === 'notas' ? !!x.h.n : filter ? x.h.c === filter : true))
    .sort((a, b) => b.h.t - a.h.t);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <T variant="title">
        Mis{' '}
        <T variant="title" style={{ color: c.muted }}>
          resaltados
        </T>
      </T>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        <Filter label="Todos" selected={filter === null} onPress={() => setFilter(null)} />
        <Filter label="Con nota" selected={filter === 'notas'} onPress={() => setFilter('notas')} />
        {HIGHLIGHT_COLORS.map((color) => (
          <Touchable
            key={color}
            accessibilityRole="radio"
            accessibilityLabel={color}
            accessibilityState={{ selected: filter === color }}
            onPress={() => setFilter(filter === color ? null : color)}
            style={[
              styles.swatch,
              { backgroundColor: HIGHLIGHT_HEX[color] },
              filter === color && { borderWidth: 3, borderColor: c.text },
            ]}
          />
        ))}
      </ScrollView>

      {items.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: c.surface }]}>
          <T style={{ fontFamily: Fonts.uiBold, fontSize: 16 }}>Todavía no hay nada acá</T>
          <T variant="muted" style={{ marginTop: 4 }}>
            En la Biblia, tocá un versículo para resaltarlo en colores o escribirle una nota.
          </T>
        </View>
      ) : (
        items.map(({ k, h, v }) => {
          const book = getBook(v!.book)!;
          const text = getChapter(book.code, v!.chapter)?.[v!.verse - 1];
          if (!text) return null;
          return (
            <PressLink
              key={k}
              href={{
                pathname: '/[book]/[chapter]',
                params: { book: book.code, chapter: v!.chapter, v: v!.verse },
              }}
              style={({ pressed }) => [
                styles.item,
                { borderColor: HIGHLIGHT_HEX[h.c], opacity: pressed ? 0.7 : 1 },
              ]}>
              <T style={{ fontFamily: Fonts.uiBold, color: c.accent }}>
                {formatRef(book, v!.chapter, v!.verse)}
              </T>
              <T style={{ fontFamily: Fonts.read, fontSize: 17, lineHeight: 27, marginTop: 4 }}>{text}</T>
              {h.n && (
                <T
                  style={{
                    fontFamily: Fonts.readItalic,
                    color: c.muted,
                    marginTop: 6,
                    fontSize: 15,
                    lineHeight: 22,
                  }}>
                  {h.n}
                </T>
              )}
            </PressLink>
          );
        })
      )}
    </ScrollView>
  );
}

function Filter({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const c = usePalette();
  return (
    <Touchable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, { backgroundColor: selected ? c.fill : c.surface }]}>
      <T style={{ fontFamily: Fonts.uiBold, fontSize: 14, color: selected ? c.fillInk : c.text }}>{label}</T>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  page: { padding: Space.lg, paddingBottom: Space.xxl, maxWidth: 720, width: '100%', alignSelf: 'center' },
  filters: { gap: Space.sm, alignItems: 'center', paddingVertical: Space.md },
  chip: { borderRadius: Radius.pill, paddingHorizontal: 14, paddingVertical: 8 },
  swatch: { width: 32, height: 32, borderRadius: 16 },
  empty: { padding: Space.lg, borderRadius: Radius.md, marginTop: Space.sm },
  item: { paddingLeft: Space.md, borderLeftWidth: 4, paddingVertical: Space.sm, marginTop: Space.md },
});
