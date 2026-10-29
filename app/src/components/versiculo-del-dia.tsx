import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { CardThumb } from '@/components/card-thumb';
import { ShareCardButton } from '@/components/share-card-button';
import { CARD_WIDTH } from '@/components/story-card';
import { T } from '@/components/text';
import { Fonts, Space, usePalette } from '@/constants/theme';
import { shareRange, shareText, type Devocional } from '@/data/devocionales';
import { designName, designsForDay } from '@/data/disenos';
import { MARKS } from '@/data/marcas';
import { formatRef, getBook, getChapter } from '@/lib/bible';
import { usePlus } from '@/lib/plus';

const SCALE = 0.62;
const GAP = 12;

/** El versículo del día en 3 diseños que cambian cada día. El primero es gratis; los otros, de Plus. */
export function VersiculoDelDia({ devocional: d, date }: { devocional: Devocional; date: Date }) {
  const c = usePalette();
  const { isPlus } = usePlus();
  const designs = designsForDay(date);
  const [index, setIndex] = useState(0);
  const W = CARD_WIDTH * SCALE;

  const [a, b] = shareRange(d);
  const text = shareText(getChapter(d.book, d.chapter)!.slice(a - 1, b));
  const reference = formatRef(getBook(d.book)!, d.chapter, a, b);
  const locked = (i: number) => i > 0 && !isPlus;

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={W + GAP + 6}
        decelerationRate="fast"
        contentContainerStyle={{ gap: GAP, paddingHorizontal: Space.lg }}
        style={{ marginHorizontal: -Space.lg }}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / (W + GAP + 6));
          setIndex(Math.min(designs.length - 1, Math.max(0, i)));
        }}>
        {designs.map((design, i) => (
          <CardThumb
            key={`${design.style}-${design.tone}`}
            design={design}
            text={text}
            reference={reference}
            marks={MARKS[d.id]}
            scale={SCALE}
            selected={i === index}
            locked={locked(i)}
            onPress={() => setIndex(i)}
          />
        ))}
      </ScrollView>

      <View style={styles.row}>
        <View style={styles.names}>
          {designs.map((design, i) => (
            <T
              key={i}
              style={{
                fontFamily: i === index ? Fonts.uiBold : Fonts.ui,
                fontSize: 14,
                color: i === index ? c.text : c.muted,
              }}>
              {designName(design)}
            </T>
          ))}
        </View>
        <ShareCardButton
          design={designs[index]}
          text={text}
          reference={reference}
          marks={MARKS[d.id]}
          locked={locked(index)}
        />
        <T variant="muted" style={{ textAlign: 'center', fontSize: 13 }}>
          Para compartir otro versículo, tocalo en la Biblia.
        </T>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginTop: Space.md, gap: Space.md },
  names: { flexDirection: 'row', justifyContent: 'center', gap: Space.lg },
});
