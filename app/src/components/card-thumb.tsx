import { StyleSheet, View } from 'react-native';

import { IconLock } from '@/components/icons';
import { Touchable } from '@/components/press-link';
import { CARD_HEIGHT, CARD_WIDTH, StoryCard } from '@/components/story-card';
import { T } from '@/components/text';
import { Fonts, usePalette } from '@/constants/theme';
import { designName, type Design } from '@/data/disenos';
import type { Marks } from '@/data/marcas';

type Props = {
  design: Design;
  text: string;
  reference: string;
  marks?: Marks;
  scale: number;
  selected: boolean;
  locked?: boolean;
  onPress: () => void;
};

/** Miniatura de un diseño, con candado si es de Plus. */
export function CardThumb({ design, text, reference, marks, scale, selected, locked, onPress }: Props) {
  const c = usePalette();
  const radius = Math.max(8, 22 * scale);
  return (
    <Touchable
      accessibilityRole="button"
      accessibilityLabel={`Diseño ${designName(design)}${locked ? ', con Plus' : ''}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.frame, { borderColor: selected ? c.accent : 'transparent', borderRadius: radius + 3 }]}>
      <View
        style={{
          width: CARD_WIDTH * scale,
          height: CARD_HEIGHT * scale,
          overflow: 'hidden',
          borderRadius: radius,
        }}>
        <View style={{ transform: [{ scale }], transformOrigin: 'top left' }}>
          <StoryCard design={design} text={text} reference={reference} marks={marks} />
        </View>
        {locked && (
          <View style={[styles.badge, scale < 0.3 && styles.badgeSmall]}>
            <IconLock color="#ffffff" size={11} />
            {scale >= 0.3 && <T style={styles.badgeText}>Plus</T>}
          </View>
        )}
      </View>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  frame: { borderWidth: 2, padding: 1 },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.62)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeSmall: { top: 4, right: 4, paddingHorizontal: 5, paddingVertical: 5 },
  badgeText: { color: '#ffffff', fontFamily: Fonts.uiBold, fontSize: 11 },
});
