import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import type { Reminder } from '@/lib/personal';

// Recordatorio diario local (no pasa por ningún servidor). En la web no hay notificaciones.
export const remindersSupported = Platform.OS !== 'web';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/** Programa (o cancela, con null) el recordatorio. Devuelve false si no hay permiso. */
export async function scheduleReminder(r: Reminder): Promise<boolean> {
  if (!remindersSupported) return false;
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!r) return true;
  const perm = await Notifications.requestPermissionsAsync();
  if (!perm.granted) return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('recordatorio', {
      name: 'Recordatorio diario',
      importance: AndroidImportance.DEFAULT,
    });
  }
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Tu momento de hoy',
      body: 'Un pasaje, una reflexión corta y una pregunta te esperan.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: r.hour,
      minute: r.minute,
      channelId: 'recordatorio',
    },
  });
  return true;
}
