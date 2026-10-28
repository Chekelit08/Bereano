import * as Sharing from 'expo-sharing';
import type { RefObject } from 'react';
import { Platform, Share, type ViewInstance } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { CARD_HEIGHT, CARD_WIDTH } from '@/components/story-card';

/** Saca la foto de la tarjeta en 1080x1920 y abre el menú de compartir. En web, comparte texto. */
export async function shareCard(card: RefObject<ViewInstance | null>, text: string, title: string) {
  try {
    if (Platform.OS !== 'web' && (await Sharing.isAvailableAsync())) {
      const uri = await captureRef(card, {
        format: 'png',
        quality: 1,
        width: CARD_WIDTH * 3,
        height: CARD_HEIGHT * 3,
        result: 'tmpfile',
      });
      await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png', dialogTitle: title });
    } else {
      await Share.share({ message: text });
    }
  } catch {
    // El usuario canceló o el sistema no pudo compartir.
  }
}
