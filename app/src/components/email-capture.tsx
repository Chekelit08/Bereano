import { useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';

import { Touchable } from '@/components/press-link';
import { T } from '@/components/text';
import { Fonts, Radius, Space, usePalette } from '@/constants/theme';
import { track } from '@/lib/analytics';
import { isValidEmail, normalizeEmail } from '@/lib/email';
import { success } from '@/lib/haptics';
import { useSettings } from '@/lib/settings';
import { supabase } from '@/lib/supabase';

/**
 * "Recibí el devocional en tu email". Guarda el email en la lista (solo INSERT: nadie lo puede
 * leer desde la app) y en el teléfono solo queda que ya se anotó.
 */
export function EmailCapture({ origen }: { origen: 'hoy' | 'devocional' | 'ajustes' }) {
  const c = usePalette();
  const { emailJoined, setEmailJoined } = useSettings();
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'error' | 'limit'>('idle');

  if (emailJoined)
    return (
      <View style={[styles.box, { backgroundColor: c.surface }]}>
        <T style={styles.title}>Listo, estás anotado ✓</T>
        <T variant="muted" style={{ marginTop: 2 }}>
          Te avisamos por email cuando empecemos a mandar el devocional.
        </T>
      </View>
    );

  async function send() {
    if (!isValidEmail(email)) return setState('error');
    setState('busy');
    const { error } = await supabase
      .from('waitlist')
      .insert({ email: normalizeEmail(email), source: 'app_devocional_email' });
    // 23505: ya estaba anotado. Para la persona es lo mismo: queda anotada.
    if (error && error.code !== '23505') return setState(error.code === 'P0001' ? 'limit' : 'error');
    success();
    track('email_registrado', { origen });
    setEmailJoined();
  }

  return (
    <View style={[styles.box, { backgroundColor: c.surface }]}>
      <T style={styles.title}>Recibí el devocional en tu email</T>
      <T variant="muted" style={{ marginTop: 2 }}>
        Un versículo y una reflexión corta cada mañana. Te avisamos cuando empiece; podés darte de baja cuando
        quieras.
      </T>
      <View style={styles.row}>
        <TextInput
          value={email}
          onChangeText={(t) => {
            setEmail(t.slice(0, 254));
            if (state === 'error') setState('idle');
          }}
          placeholder="tu@email.com"
          placeholderTextColor={c.muted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="send"
          onSubmitEditing={send}
          accessibilityLabel="Tu email"
          style={[styles.input, { color: c.text, backgroundColor: c.bg, borderColor: c.line }]}
        />
        <Touchable
          accessibilityRole="button"
          disabled={state === 'busy'}
          onPress={send}
          style={({ pressed }) => [styles.btn, { backgroundColor: c.fill, opacity: pressed ? 0.85 : 1 }]}>
          {state === 'busy' ? (
            <ActivityIndicator color={c.fillInk} />
          ) : (
            <T style={{ color: c.fillInk, fontFamily: Fonts.uiBold, fontSize: 15 }}>Anotarme</T>
          )}
        </Touchable>
      </View>
      {state === 'error' && (
        <T style={[styles.msg, { color: '#E5484D' }]}>Revisá el email: parece que tiene un error.</T>
      )}
      {state === 'limit' && (
        <T style={[styles.msg, { color: c.muted }]}>
          Demasiados intentos desde esta conexión. Probá más tarde.
        </T>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { padding: Space.lg, borderRadius: Radius.md },
  title: { fontFamily: Fonts.uiBold, fontSize: 16 },
  row: { flexDirection: 'row', gap: Space.sm, marginTop: Space.md },
  input: {
    flex: 1,
    minWidth: 0,
    fontFamily: Fonts.ui,
    fontSize: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.pill,
    paddingHorizontal: Space.md,
    paddingVertical: 11,
  },
  btn: {
    borderRadius: Radius.pill,
    paddingHorizontal: Space.md,
    justifyContent: 'center',
    minWidth: 100,
    alignItems: 'center',
  },
  msg: { marginTop: Space.sm, fontSize: 13 },
});
