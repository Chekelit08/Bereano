import type { Ref } from 'react';
import { StyleSheet, Text, View, type TextStyle, type ViewInstance } from 'react-native';
import Svg, { Defs, Ellipse, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { findSequence, type Marks } from '@/data/marcas';

export const CARD_WIDTH = 360;
export const CARD_HEIGHT = 640; // 9:16, se exporta a 1080x1920 para historias

export type CardStyle = 'editorial' | 'noche' | 'papel' | 'neon';
export const CARD_STYLES: { id: CardStyle; name: string }[] = [
  { id: 'editorial', name: 'Editorial' },
  { id: 'noche', name: 'Noche' },
  { id: 'papel', name: 'Papel' },
  { id: 'neon', name: 'Neón' },
];

type Props = { text: string; reference: string; marks?: Marks; variant: CardStyle; ref?: Ref<ViewInstance> };

/** Imagen del versículo del día para historias. El texto siempre sale de la Biblia de la app. */
export function StoryCard({ variant, ...props }: Props) {
  if (variant === 'noche') return <Noche {...props} />;
  if (variant === 'papel') return <Papel {...props} />;
  if (variant === 'neon') return <Neon {...props} />;
  return <Editorial {...props} />;
}

const size = (text: string, big: number) => (text.length > 200 ? big - 7 : text.length > 130 ? big - 4 : big);

// ---------- Editorial: tierra y bosque, tipografías mezcladas, marcas a mano ----------

function Editorial({ text, reference, marks = {}, ref }: Omit<Props, 'variant'>) {
  const fs = size(text, 29);
  const words = text.split(' ');
  const underline = marks.underline?.split(' ') ?? [];
  const uStart = underline.length ? findSequence(words, underline) : -1;

  return (
    <View ref={ref} collapsable={false} style={styles.card}>
      <Svg style={StyleSheet.absoluteFill} width={CARD_WIDTH} height={CARD_HEIGHT}>
        <Defs>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#5b4a2e" />
            <Stop offset="0.45" stopColor="#2d2617" />
            <Stop offset="1" stopColor="#0e0d0a" />
          </LinearGradient>
          <RadialGradient id="sun" cx="0.75" cy="0.12" r="0.7">
            <Stop offset="0" stopColor="#e9a54b" stopOpacity="0.55" />
            <Stop offset="1" stopColor="#e9a54b" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#sky)" />
        <Rect width="100%" height="100%" fill="url(#sun)" />
        {/* Montañas y bosque en capas */}
        <Path
          d="M0 470 L60 420 L110 445 L180 380 L240 430 L300 395 L360 440 L360 640 L0 640 Z"
          fill="#1f1a12"
        />
        <Path
          d="M0 520 L40 500 L80 515 L130 485 L190 520 L250 495 L310 525 L360 505 L360 640 L0 640 Z"
          fill="#14110c"
        />
      </Svg>
      <View style={styles.editorialBody}>
        <View style={styles.words}>
          {words.map((w, i) => {
            const style: TextStyle[] = [
              { fontFamily: 'Fraunces_400Regular', fontSize: fs, lineHeight: fs * 1.3, color: '#f4ecdf' },
            ];
            if (marks.bold?.includes(w))
              style.push({ fontFamily: 'Archivo_800ExtraBold', fontSize: fs * 0.9, letterSpacing: -0.3 });
            if (marks.italic?.includes(w)) style.push({ fontFamily: 'Fraunces_400Regular_Italic' });
            const circled = w === marks.circle;
            const underlined = uStart >= 0 && i >= uStart && i < uStart + underline.length;
            return (
              <View key={i} style={{ marginRight: fs * 0.26 }}>
                <Text style={style}>{w}</Text>
                {circled && (
                  <Svg
                    style={styles.circle}
                    width="100%"
                    height="100%"
                    viewBox="0 0 100 40"
                    preserveAspectRatio="none">
                    <Ellipse
                      cx="50"
                      cy="21"
                      rx="49"
                      ry="17"
                      stroke="#e7b24a"
                      strokeWidth="1.6"
                      fill="none"
                      transform="rotate(-3 50 21)"
                    />
                  </Svg>
                )}
                {underlined && (
                  <Svg
                    style={styles.underline}
                    width="120%"
                    height="10"
                    viewBox="0 0 100 10"
                    preserveAspectRatio="none">
                    <Path
                      d="M0 6 C 25 3, 50 8, 100 4"
                      stroke="#e7b24a"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </Svg>
                )}
              </View>
            );
          })}
        </View>
        <View style={styles.refRow}>
          <Svg width={14} height={14} viewBox="0 0 14 14">
            <Path d="M2 1 H12 V13 L7 9.5 L2 13 Z" fill="#e7b24a" />
          </Svg>
          <Text style={styles.refCaps}>{reference.toUpperCase()}</Text>
        </View>
      </View>
      <Brand color="#f4ecdf" />
    </View>
  );
}

// ---------- Noche: cielo con estrellas ----------

function Noche({ text, reference, ref }: Omit<Props, 'variant' | 'marks'>) {
  const fs = size(text, 30);
  return (
    <View ref={ref} collapsable={false} style={styles.card}>
      <Svg style={StyleSheet.absoluteFill} width={CARD_WIDTH} height={CARD_HEIGHT}>
        <Defs>
          <LinearGradient id="night" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#0b1a3a" />
            <Stop offset="0.6" stopColor="#13306a" />
            <Stop offset="1" stopColor="#1c2a3f" />
          </LinearGradient>
          <RadialGradient id="nebula" cx="0.2" cy="0.15" r="0.55">
            <Stop offset="0" stopColor="#9a7fc9" stopOpacity="0.35" />
            <Stop offset="1" stopColor="#9a7fc9" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="horizon" cx="0.5" cy="1" r="0.6">
            <Stop offset="0" stopColor="#f0a07a" stopOpacity="0.35" />
            <Stop offset="1" stopColor="#f0a07a" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#night)" />
        <Rect width="100%" height="100%" fill="url(#nebula)" />
        <Rect width="100%" height="100%" fill="url(#horizon)" />
        {STARS.map((s, i) => (
          <Rect key={i} x={s.x} y={s.y} width={s.r} height={s.r} rx={s.r / 2} fill="#ffffff" opacity={s.o} />
        ))}
        <Path
          d="M0 560 L30 540 L45 552 L70 520 L95 548 L120 530 L150 556 L185 525 L210 550 L245 528 L280 552 L315 532 L360 556 L360 640 L0 640 Z"
          fill="#07101c"
        />
      </Svg>
      <View style={styles.nocheBody}>
        <Text style={styles.nocheKicker}>Versículo del día</Text>
        <Text style={styles.nocheRef}>{reference}</Text>
        <Text
          style={{
            fontFamily: 'Literata_400Regular',
            fontSize: fs,
            lineHeight: fs * 1.32,
            color: '#ffffff',
            marginTop: 18,
          }}>
          {text}
        </Text>
      </View>
      <Brand color="#ffffff" />
    </View>
  );
}

// Estrellas fijas (siempre las mismas: la imagen no cambia entre capturas).
const STARS = Array.from({ length: 140 }, (_, i) => {
  const r = (n: number) => {
    const x = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  return { x: r(1) * CARD_WIDTH, y: r(2) * 520, r: r(3) < 0.9 ? 1.2 : 2.4, o: 0.35 + r(4) * 0.6 };
});

// ---------- Papel: papel rasgado y mayúsculas azules ----------

function Papel({ text, reference, ref }: Omit<Props, 'variant' | 'marks'>) {
  const fs = size(text, 31) - 1;
  return (
    <View ref={ref} collapsable={false} style={[styles.card, { backgroundColor: '#efe9df' }]}>
      <Svg style={StyleSheet.absoluteFill} width={CARD_WIDTH} height={CARD_HEIGHT}>
        <Path d={torn(0, 26, 1)} fill="#0b0b0b" />
        <Path d={torn(CARD_HEIGHT, CARD_HEIGHT - 26, 7)} fill="#0b0b0b" />
      </Svg>
      <View style={styles.papelBody}>
        <Text style={styles.papelRef}>{reference.toUpperCase()}</Text>
        <Text
          style={{
            fontFamily: 'Archivo_800ExtraBold',
            fontSize: fs,
            lineHeight: fs * 1.08,
            color: '#1f3fe0',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: -0.4,
            marginTop: 18,
          }}>
          {text}
        </Text>
      </View>
      <Brand color="#0b0b0b" bottom={44} />
    </View>
  );
}

/** Borde de papel rasgado entre `edge` (borde de la imagen) y `y`. */
function torn(edge: number, y: number, seed: number) {
  let d = `M0 ${edge} L0 ${y}`;
  for (let x = 0; x <= CARD_WIDTH; x += 4) {
    // Ruido pseudoaleatorio fijo: irregular como un papel rasgado, siempre igual.
    const r = Math.sin((x + seed) * 12.9898) * 43758.5453;
    const n = (r - Math.floor(r) - 0.5) * 7 + Math.sin((x + seed) * 0.05) * 6;
    d += ` L${x} ${y + n}`;
  }
  return `${d} L${CARD_WIDTH} ${edge} Z`;
}

// ---------- Neón: letras de luz sobre negro ----------

function Neon({ text, reference, ref }: Omit<Props, 'variant' | 'marks'>) {
  const fs = size(text, 33);
  const glow = {
    textShadowColor: '#ff2d7a',
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 0 },
  };
  return (
    <View ref={ref} collapsable={false} style={[styles.card, { backgroundColor: '#0a0a0c' }]}>
      <Svg style={StyleSheet.absoluteFill} width={CARD_WIDTH} height={CARD_HEIGHT}>
        <Defs>
          <RadialGradient id="halo" cx="0.5" cy="0.25" r="0.45">
            <Stop offset="0" stopColor="#ff2d7a" stopOpacity="0.45" />
            <Stop offset="1" stopColor="#ff2d7a" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        {/* Pliegues de plástico arrugado */}
        {[40, 130, 260, 380, 470, 590].map((y, i) => (
          <Path
            key={i}
            d={`M-20 ${y} L${120 + i * 20} ${y - 40} L380 ${y + 30}`}
            stroke="#ffffff"
            strokeOpacity="0.05"
            strokeWidth="14"
            fill="none"
          />
        ))}
        <Rect width="100%" height="100%" fill="url(#halo)" />
        {/* Cruz de neón: tres trazos para el brillo */}
        {[
          { w: 14, o: 0.15 },
          { w: 7, o: 0.35 },
          { w: 2.5, o: 1 },
        ].map((s, i) => (
          <Path
            key={i}
            d="M180 70 V230 M135 115 H225"
            stroke={i === 2 ? '#c6fff3' : '#63f5d6'}
            strokeOpacity={s.o}
            strokeWidth={s.w}
            strokeLinecap="round"
          />
        ))}
      </Svg>
      <View style={styles.neonBody}>
        <Text
          style={[
            {
              fontFamily: 'Caveat_700Bold',
              fontSize: fs,
              lineHeight: fs * 1.1,
              color: '#7ff7df',
              textAlign: 'center',
            },
            glow,
          ]}>
          {text}
        </Text>
        <Text
          style={[
            {
              fontFamily: 'Caveat_700Bold',
              fontSize: 28,
              color: '#7ff7df',
              textAlign: 'center',
              marginTop: 18,
            },
            glow,
          ]}>
          {reference}
        </Text>
      </View>
      <Brand color="#7ff7df" />
    </View>
  );
}

function Brand({ color, bottom = 34 }: { color: string; bottom?: number }) {
  return (
    <View style={[styles.brand, { bottom }]}>
      <Text style={{ fontFamily: 'Fraunces_500Medium', fontSize: 15, color, opacity: 0.85 }}>Bereano</Text>
      <Text style={{ fontFamily: 'Literata_400Regular', fontSize: 10, color, opacity: 0.6 }}>
        Reina-Valera 1909
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: CARD_WIDTH, height: CARD_HEIGHT, overflow: 'hidden', backgroundColor: '#0f0c0a' },
  editorialBody: {
    position: 'absolute',
    left: 30,
    right: 30,
    top: 60,
    bottom: 130,
    justifyContent: 'center',
  },
  words: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline' },
  circle: { position: 'absolute', left: '-9%', top: '-6%', width: '118%', height: '112%' },
  underline: { position: 'absolute', left: '-6%', bottom: -2 },
  refRow: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-end', marginTop: 22 },
  refCaps: { fontFamily: 'Archivo_700Bold', fontSize: 13, letterSpacing: 2, color: '#f4ecdf' },
  nocheBody: { position: 'absolute', left: 30, right: 30, top: 60, bottom: 150, justifyContent: 'center' },
  nocheKicker: { fontFamily: 'Archivo_700Bold', fontSize: 12, color: '#ffffff', opacity: 0.85 },
  nocheRef: { fontFamily: 'Archivo_800ExtraBold', fontSize: 17, color: '#ffffff', marginTop: 4 },
  papelBody: {
    position: 'absolute',
    left: 26,
    right: 26,
    top: 60,
    bottom: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  papelRef: { fontFamily: 'Archivo_800ExtraBold', fontSize: 16, color: '#0b0b0b' },
  neonBody: { position: 'absolute', left: 26, right: 26, top: 250, bottom: 90, justifyContent: 'center' },
  brand: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
});
