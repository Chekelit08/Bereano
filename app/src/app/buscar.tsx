import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';

import { PressLink } from '@/components/press-link';
import { T } from '@/components/text';
import { Fonts, Space, usePalette } from '@/constants/theme';
import { parseReference, searchText, type Hit } from '@/lib/bible';

const MAX_QUERY = 100;

export default function Search() {
  const c = usePalette();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{ q: string; hits: Hit[] } | null>(null);

  const q = query.trim();
  const ref = parseReference(q);
  // Solo se muestran resultados de la búsqueda actual.
  const hits = q.length >= 3 && result?.q === q ? result.hits : null;

  // Espera a que deje de escribir para buscar en los 31.102 versículos.
  useEffect(() => {
    if (q.length < 3) return;
    const t = setTimeout(() => setResult({ q, hits: searchText(q) }), 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <FlatList
      data={hits ?? []}
      keyExtractor={(h) => `${h.book.code}${h.chapter}:${h.verse}`}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={styles.container}
      ListHeaderComponent={
        <View>
          <TextInput
            value={query}
            onChangeText={(t) => setQuery(t.slice(0, MAX_QUERY))}
            placeholder="Juan 3:16, amor, “buen pastor”…"
            placeholderTextColor={c.muted}
            autoFocus
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel="Buscar en la Biblia"
            style={[styles.input, { color: c.text, borderColor: c.line, backgroundColor: c.surface }]}
          />
          {ref && (
            <PressLink
              href={{
                pathname: '/[book]/[chapter]',
                params: { book: ref.book.code, chapter: ref.chapter, ...(ref.verse ? { v: ref.verse } : {}) },
              }}
              style={({ pressed }) => [
                styles.goTo,
                { backgroundColor: c.fill, opacity: pressed ? 0.85 : 1 },
              ]}>
              <T style={{ color: c.fillInk, fontFamily: Fonts.uiBold, fontSize: 18 }}>
                Ir a {ref.book.name} {ref.chapter}
                {ref.verse ? `:${ref.verse}` : ''} →
              </T>
            </PressLink>
          )}
          {hits && !(ref && hits.length === 0) && (
            <T variant="label" style={{ marginTop: Space.lg, marginBottom: Space.sm }}>
              {hits.length === 0
                ? 'Sin resultados'
                : hits.length === 100
                  ? 'Primeros 100 resultados'
                  : `${hits.length} resultados`}
            </T>
          )}
        </View>
      }
      renderItem={({ item }) => (
        <PressLink
          href={{
            pathname: '/[book]/[chapter]',
            params: { book: item.book.code, chapter: item.chapter, v: item.verse },
          }}
          style={({ pressed }) => [styles.hit, { borderColor: c.line, opacity: pressed ? 0.6 : 1 }]}>
          <T style={{ fontFamily: Fonts.uiBold, color: c.accent, fontSize: 15 }}>
            {item.book.name} {item.chapter}:{item.verse}
          </T>
          <T style={{ marginTop: 2 }} numberOfLines={3}>
            {item.text}
          </T>
        </PressLink>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: Space.lg, maxWidth: 720, width: '100%', alignSelf: 'center' },
  input: {
    fontFamily: Fonts.ui,
    fontSize: 17,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingHorizontal: Space.md,
    paddingVertical: 14,
  },
  goTo: { marginTop: Space.md, borderRadius: 14, padding: Space.md },
  hit: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
});
