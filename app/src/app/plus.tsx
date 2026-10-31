import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform, ScrollView, StyleSheet, View } from 'react-native';
import type { PurchasesPackage } from 'react-native-purchases';

import { IconCheck } from '@/components/icons';
import { Touchable } from '@/components/press-link';
import { T } from '@/components/text';
import { FALLBACK_PRICES, PLUS_DAILY_QUESTIONS, SITE_URL } from '@/constants/config';
import { Fonts, Radius, Space, usePalette } from '@/constants/theme';
import { track } from '@/lib/analytics';
import { success } from '@/lib/haptics';
import { usePlus } from '@/lib/plus';

const BENEFITS = [
  {
    title: 'Compañero de estudio',
    detail: `Hasta ${PLUS_DAILY_QUESTIONS} preguntas por día, siempre con citas verificadas.`,
  },
  {
    title: 'Planes por tema',
    detail: 'Ansiedad, perdón, familia, fe en la tormenta, duelo y los que vienen.',
  },
  {
    title: 'Diseños para historias',
    detail: 'Los 3 diseños de cada día y 36 más para compartir cualquier versículo.',
  },
  {
    title: 'Lo esencial, gratis siempre',
    detail: 'La Biblia, el buscador, el devocional y el plan de Juan no se cobran.',
  },
];

type Choice = 'annual' | 'monthly';

/** Paywall de Bereano Plus. Precios de la tienda; si todavía no hay tienda, modo demostración. */
export default function Plus() {
  const c = usePalette();
  const router = useRouter();
  const { isPlus, status, annual, monthly, purchase, restore } = usePlus();
  const [choice, setChoice] = useState<Choice>('annual');
  const [busy, setBusy] = useState(false);

  const pkg: PurchasesPackage | null = choice === 'annual' ? annual : monthly;
  const annualPrice = annual?.product.priceString ?? FALLBACK_PRICES.annual;
  const monthlyPrice = monthly?.product.priceString ?? FALLBACK_PRICES.monthly;
  const annualPerMonth = annual?.product.pricePerMonthString ?? FALLBACK_PRICES.annualPerMonth;
  const trial = choice === 'annual'; // la prueba de 7 días va en el plan anual (oferta introductoria)

  useEffect(() => {
    track('paywall_visto');
  }, []);

  async function buy() {
    track('compra_intento', { plan: choice });
    if (status !== 'ready' || !pkg) {
      Alert.alert(
        'Vista previa',
        'Las compras se activan cuando estén configuradas la App Store y Google Play. Por ahora es una demostración.',
      );
      return;
    }
    setBusy(true);
    const r = await purchase(pkg);
    setBusy(false);
    if (r === 'ok') {
      success();
      router.back();
    } else if (r === 'error') {
      Alert.alert('No se pudo completar la compra', 'No se te cobró nada. Probá de nuevo en un rato.');
    }
  }

  async function onRestore() {
    setBusy(true);
    const ok = await restore();
    setBusy(false);
    Alert.alert(
      ok ? 'Listo' : 'Sin compras para restaurar',
      ok ? 'Recuperaste Bereano Plus.' : 'No encontramos una suscripción con esta cuenta de la tienda.',
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Stack.Screen options={{ title: '', presentation: 'modal' }} />
      <T variant="label">Bereano Plus</T>
      <T variant="title" style={{ marginTop: 4 }}>
        Estudiá más a fondo.{' '}
        <T variant="title" style={{ color: c.muted }}>
          Cada día.
        </T>
      </T>

      {isPlus ? (
        <View style={[styles.box, { backgroundColor: c.surface, marginTop: Space.xl }]}>
          <T style={{ fontFamily: Fonts.uiBold, fontSize: 17 }}>Ya tenés Bereano Plus</T>
          <T variant="muted" style={{ marginTop: 4 }}>
            Gracias por acompañar el proyecto. Podés administrar la suscripción desde la tienda de tu
            teléfono.
          </T>
        </View>
      ) : (
        <>
          <View style={{ marginTop: Space.xl, gap: Space.md }}>
            {BENEFITS.map((b) => (
              <View key={b.title} style={styles.benefit}>
                <IconCheck color={c.fill} filled size={24} />
                <View style={{ flex: 1 }}>
                  <T style={{ fontFamily: Fonts.uiBold, fontSize: 16 }}>{b.title}</T>
                  <T variant="muted">{b.detail}</T>
                </View>
              </View>
            ))}
          </View>

          <View style={{ marginTop: Space.xl, gap: Space.sm }} accessibilityRole="radiogroup">
            <Option
              selected={choice === 'annual'}
              onPress={() => setChoice('annual')}
              title="Anual"
              price={`${annualPrice} al año`}
              note={`${annualPerMonth} por mes · 7 días gratis`}
              badge="Ahorrás 52%"
            />
            <Option
              selected={choice === 'monthly'}
              onPress={() => setChoice('monthly')}
              title="Mensual"
              price={`${monthlyPrice} por mes`}
              note="Cancelás cuando quieras"
            />
          </View>

          <Touchable
            accessibilityRole="button"
            disabled={busy}
            onPress={buy}
            style={({ pressed }) => [
              styles.cta,
              { backgroundColor: c.fill, opacity: pressed || busy ? 0.85 : 1 },
            ]}>
            {busy ? (
              <ActivityIndicator color={c.fillInk} />
            ) : (
              <T style={{ fontFamily: Fonts.uiBold, fontSize: 17, color: c.fillInk }}>
                {trial ? 'Empezar 7 días gratis' : 'Suscribirme'}
              </T>
            )}
          </Touchable>

          <T variant="muted" style={styles.legal}>
            {trial
              ? `Gratis por 7 días; después ${annualPrice} al año. Se renueva automáticamente salvo que canceles al menos 24 horas antes del final del período.`
              : `${monthlyPrice} por mes. Se renueva automáticamente salvo que canceles al menos 24 horas antes del final del período.`}{' '}
            Lo administrás desde {Platform.OS === 'android' ? 'Google Play' : 'la App Store'}.
          </T>
        </>
      )}

      <View style={styles.links}>
        <Touchable onPress={onRestore} disabled={busy} accessibilityRole="button">
          <T style={[styles.link, { color: c.accent }]}>Restaurar compras</T>
        </Touchable>
        <Touchable onPress={() => Linking.openURL(`${SITE_URL}/terminos`)} accessibilityRole="link">
          <T style={[styles.link, { color: c.accent }]}>Términos</T>
        </Touchable>
        <Touchable onPress={() => Linking.openURL(`${SITE_URL}/privacidad`)} accessibilityRole="link">
          <T style={[styles.link, { color: c.accent }]}>Privacidad</T>
        </Touchable>
      </View>
      {status === 'demo' && (
        <T variant="muted" style={{ textAlign: 'center', marginTop: Space.sm, fontSize: 12 }}>
          Vista previa: todavía no se cobra nada.
        </T>
      )}
    </ScrollView>
  );
}

function Option(props: {
  selected: boolean;
  onPress: () => void;
  title: string;
  price: string;
  note: string;
  badge?: string;
}) {
  const c = usePalette();
  return (
    <Touchable
      accessibilityRole="radio"
      accessibilityState={{ checked: props.selected }}
      onPress={props.onPress}
      style={[
        styles.option,
        { backgroundColor: c.surface, borderColor: props.selected ? c.fill : 'transparent' },
      ]}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Space.sm }}>
          <T style={{ fontFamily: Fonts.uiBold, fontSize: 17 }}>{props.title}</T>
          {props.badge && (
            <View style={[styles.badge, { backgroundColor: c.fill }]}>
              <T style={{ fontFamily: Fonts.uiBold, fontSize: 11, color: c.fillInk }}>{props.badge}</T>
            </View>
          )}
        </View>
        <T style={{ fontFamily: Fonts.uiSemi, fontSize: 15, marginTop: 2 }}>{props.price}</T>
        <T variant="muted">{props.note}</T>
      </View>
      <View style={[styles.radio, { borderColor: props.selected ? c.fill : c.muted }]}>
        {props.selected && <View style={[styles.radioDot, { backgroundColor: c.fill }]} />}
      </View>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  page: { padding: Space.lg, paddingBottom: Space.xxl, maxWidth: 560, width: '100%', alignSelf: 'center' },
  box: { padding: Space.lg, borderRadius: Radius.md },
  benefit: { flexDirection: 'row', gap: Space.md, alignItems: 'flex-start' },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Space.md,
    borderRadius: Radius.md,
    borderWidth: 2,
  },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 12, height: 12, borderRadius: 6 },
  cta: { marginTop: Space.lg, borderRadius: Radius.pill, paddingVertical: 17, alignItems: 'center' },
  legal: { marginTop: Space.md, fontSize: 12, lineHeight: 17, textAlign: 'center' },
  links: { flexDirection: 'row', justifyContent: 'center', gap: Space.xl, marginTop: Space.lg },
  link: { fontFamily: Fonts.uiSemi, fontSize: 14 },
});
