import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** Vibración corta al tocar. En web no hace nada. */
export function tap() {
  if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
}

export function success() {
  if (Platform.OS !== 'web')
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}
