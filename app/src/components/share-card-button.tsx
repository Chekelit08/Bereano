import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View, type ViewInstance } from 'react-native';

import { IconLock } from '@/components/icons';
import { Touchable } from '@/components/press-link';
import { CARD_WIDTH, StoryCard } from '@/components/story-card';
import { T } from '@/components/text';
import { Fonts, usePalette } from '@/constants/theme';
import type { Design } from '@/data/disenos';
import type { Marks } from '@/data/marcas';
import { shareCard } from '@/lib/share';

type Props = {
  design: Design;
  text: string;
  reference: string;
  marks?: Marks;
  /** Diseño de Plus sin suscripción: el botón lleva al paywall. */
  locked?: boolean;
  label?: string;
  variant?: 'fill' | 'outline';
};

/** Botón que comparte la tarjeta en tamaño real (se dibuja fuera de pantalla para sacarle la foto). */
export function ShareCardButton({ design, text, reference, marks, locked, label, variant = 'fill' }: Props) {
  const c = usePalette();
  const router = useRouter();
  const card = useRef<ViewInstance>(null);
  const [busy, setBusy] = useState(false);
  const fill = variant === 'fill';
  const ink = fill ? c.fillInk : c.text;

  return (
    <View>
      <Touchable
        accessibilityRole="button"
        disabled={busy}
        onPress={async () => {
          if (locked) return router.push('/plus');
          setBusy(true);
          await shareCard(card, `“${text}”\n— ${reference} (RV1909)\n\nBereano`, reference);
          setBusy(false);
        }}
        style={({ pressed }) => [
          styles.button,
          fill ? { backgroundColor: c.fill } : { borderWidth: 1, borderColor: c.text },
          { opacity: pressed || busy ? 0.7 : 1 },
        ]}>
        {locked && <IconLock color={ink} />}
        <T style={{ color: ink, fontFamily: Fonts.uiBold, fontSize: 16 }}>
          {locked ? 'Desbloquear con Plus' : (label ?? 'Compartir en historias')}
        </T>
      </Touchable>
      {!locked && (
        <View style={styles.offscreen} pointerEvents="none" aria-hidden>
          <StoryCard ref={card} design={design} text={text} reference={reference} marks={marks} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  offscreen: { position: 'absolute', left: -CARD_WIDTH * 3, top: 0 },
});
