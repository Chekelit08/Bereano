import { StyleSheet, Text, View, type TextStyle } from 'react-native';
import Svg, { Defs, Ellipse, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { findSequence } from '@/data/marcas';

import { Brand, CARD_HEIGHT, CARD_WIDTH, cardStyles, fit, noise, type CardProps } from './base';

// ---------- Editorial: paisaje en capas, tipografías mezcladas, marcas a mano ----------

const EDITORIAL = [
  // Tierra y bosque
  {
    sky: ['#5b4a2e', '#2d2617', '#0e0d0a'],
    sun: '#e9a54b',
    hills: ['#1f1a12', '#14110c'],
    ink: '#f4ecdf',
    mark: '#e7b24a',
  },
  // Bosque verde
  {
    sky: ['#3d5a44', '#1d3024', '#0a120d'],
    sun: '#d9c27a',
    hills: ['#16251b', '#0d1710'],
    ink: '#eef2e6',
    mark: '#e3c565',
  },
  // Mar al amanecer
  {
    sky: ['#4e6a86', '#22344a', '#0b121c'],
    sun: '#f2a07b',
    hills: ['#172536', '#0e1724'],
    ink: '#f1f4f8',
    mark: '#f2a07b',
  },
];

export function Editorial({ text, reference, marks = {}, tone, ref }: CardProps) {
  const p = EDITORIAL[tone] ?? EDITORIAL[0];
  const fs = fit(text, 29);
  const words = text.split(' ');
  const underline = marks.underline?.split(' ') ?? [];
  const uStart = underline.length ? findSequence(words, underline) : -1;

  return (
    <View ref={ref} collapsable={false} style={cardStyles.card}>
      <Svg style={StyleSheet.absoluteFill} width={CARD_WIDTH} height={CARD_HEIGHT}>
        <Defs>
          <LinearGradient id={`sky${tone}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={p.sky[0]} />
            <Stop offset="0.45" stopColor={p.sky[1]} />
            <Stop offset="1" stopColor={p.sky[2]} />
          </LinearGradient>
          <RadialGradient id={`sun${tone}`} cx="0.75" cy="0.12" r="0.7">
            <Stop offset="0" stopColor={p.sun} stopOpacity="0.55" />
            <Stop offset="1" stopColor={p.sun} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#sky${tone})`} />
        <Rect width="100%" height="100%" fill={`url(#sun${tone})`} />
        <Path
          d="M0 470 L60 420 L110 445 L180 380 L240 430 L300 395 L360 440 L360 640 L0 640 Z"
          fill={p.hills[0]}
        />
        <Path
          d="M0 520 L40 500 L80 515 L130 485 L190 520 L250 495 L310 525 L360 505 L360 640 L0 640 Z"
          fill={p.hills[1]}
        />
      </Svg>
      <View style={styles.editorialBody}>
        <View style={styles.words}>
          {words.map((w, i) => {
            const style: TextStyle[] = [
              { fontFamily: 'Newsreader_500Medium', fontSize: fs, lineHeight: fs * 1.3, color: p.ink },
            ];
            if (marks.bold?.includes(w))
              style.push({ fontFamily: 'Archivo_800ExtraBold', fontSize: fs * 0.9, letterSpacing: -0.3 });
            if (marks.italic?.includes(w)) style.push({ fontFamily: 'Newsreader_400Regular_Italic' });
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
                      stroke={p.mark}
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
                      stroke={p.mark}
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
            <Path d="M2 1 H12 V13 L7 9.5 L2 13 Z" fill={p.mark} />
          </Svg>
          <Text style={[styles.refCaps, { color: p.ink }]}>{reference.toUpperCase()}</Text>
        </View>
      </View>
      <Brand color={p.ink} />
    </View>
  );
}

// ---------- Noche: cielo con estrellas ----------

const NOCHE = [
  { sky: ['#0b1a3a', '#13306a', '#1c2a3f'], nebula: '#9a7fc9', horizon: '#f0a07a', ground: '#07101c' },
  { sky: ['#1a0f33', '#3a1d5e', '#2a1838'], nebula: '#e07fb8', horizon: '#ffb36b', ground: '#0e0818' },
  { sky: ['#04161a', '#0b3a3c', '#0f2a2c'], nebula: '#5ff2b5', horizon: '#7fd4ff', ground: '#03100f' },
];

export function Noche({ text, reference, tone, ref }: CardProps) {
  const p = NOCHE[tone] ?? NOCHE[0];
  const fs = fit(text, 30);
  return (
    <View ref={ref} collapsable={false} style={cardStyles.card}>
      <Svg style={StyleSheet.absoluteFill} width={CARD_WIDTH} height={CARD_HEIGHT}>
        <Defs>
          <LinearGradient id={`night${tone}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={p.sky[0]} />
            <Stop offset="0.6" stopColor={p.sky[1]} />
            <Stop offset="1" stopColor={p.sky[2]} />
          </LinearGradient>
          <RadialGradient id={`nebula${tone}`} cx="0.2" cy="0.15" r="0.55">
            <Stop offset="0" stopColor={p.nebula} stopOpacity="0.35" />
            <Stop offset="1" stopColor={p.nebula} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id={`horizon${tone}`} cx="0.5" cy="1" r="0.6">
            <Stop offset="0" stopColor={p.horizon} stopOpacity="0.35" />
            <Stop offset="1" stopColor={p.horizon} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#night${tone})`} />
        <Rect width="100%" height="100%" fill={`url(#nebula${tone})`} />
        <Rect width="100%" height="100%" fill={`url(#horizon${tone})`} />
        {STARS.map((s, i) => (
          <Rect key={i} x={s.x} y={s.y} width={s.r} height={s.r} rx={s.r / 2} fill="#ffffff" opacity={s.o} />
        ))}
        <Path
          d="M0 560 L30 540 L45 552 L70 520 L95 548 L120 530 L150 556 L185 525 L210 550 L245 528 L280 552 L315 532 L360 556 L360 640 L0 640 Z"
          fill={p.ground}
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

const STARS = Array.from({ length: 140 }, (_, i) => ({
  x: noise(i * 4 + 1) * CARD_WIDTH,
  y: noise(i * 4 + 2) * 520,
  r: noise(i * 4 + 3) < 0.9 ? 1.2 : 2.4,
  o: 0.35 + noise(i * 4 + 4) * 0.6,
}));

// ---------- Papel: papel rasgado y mayúsculas de color ----------

const PAPEL = [
  { paper: '#efe9df', ink: '#1f3fe0', edge: '#0b0b0b' },
  { paper: '#f3e6d6', ink: '#d2381c', edge: '#1b1410' },
  { paper: '#e9efe6', ink: '#0d7048', edge: '#0d1a14' },
];

export function Papel({ text, reference, tone, ref }: CardProps) {
  const p = PAPEL[tone] ?? PAPEL[0];
  const fs = fit(text, 31) - 1;
  return (
    <View ref={ref} collapsable={false} style={[cardStyles.card, { backgroundColor: p.paper }]}>
      <Svg style={StyleSheet.absoluteFill} width={CARD_WIDTH} height={CARD_HEIGHT}>
        <Path d={torn(0, 26, 1)} fill={p.edge} />
        <Path d={torn(CARD_HEIGHT, CARD_HEIGHT - 26, 7)} fill={p.edge} />
      </Svg>
      <View style={styles.papelBody}>
        <Text style={[styles.papelRef, { color: p.edge }]}>{reference.toUpperCase()}</Text>
        <Text
          style={{
            fontFamily: 'Archivo_800ExtraBold',
            fontSize: fs,
            lineHeight: fs * 1.08,
            color: p.ink,
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: -0.4,
            marginTop: 18,
          }}>
          {text}
        </Text>
      </View>
      <Brand color={p.edge} bottom={44} />
    </View>
  );
}

/** Borde de papel rasgado entre `edge` (borde de la imagen) y `y`. */
export function torn(edge: number, y: number, seed: number) {
  let d = `M0 ${edge} L0 ${y}`;
  for (let x = 0; x <= CARD_WIDTH; x += 4) {
    const n = (noise(x + seed) - 0.5) * 7 + Math.sin((x + seed) * 0.05) * 6;
    d += ` L${x} ${y + n}`;
  }
  return `${d} L${CARD_WIDTH} ${edge} Z`;
}

// ---------- Neón: letras de luz sobre negro ----------

const NEON = [
  { halo: '#ff2d7a', ink: '#7ff7df', cross: ['#63f5d6', '#c6fff3'] },
  { halo: '#2d7bff', ink: '#ffd36b', cross: ['#ffb84d', '#fff0c9'] },
  { halo: '#9b4dff', ink: '#c8ff6b', cross: ['#a6f53d', '#efffd1'] },
];

export function Neon({ text, reference, tone, ref }: CardProps) {
  const p = NEON[tone] ?? NEON[0];
  const fs = fit(text, 29);
  const glow = {
    textShadowColor: p.halo,
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 0 },
  };
  return (
    <View ref={ref} collapsable={false} style={[cardStyles.card, { backgroundColor: '#0a0a0c' }]}>
      <Svg style={StyleSheet.absoluteFill} width={CARD_WIDTH} height={CARD_HEIGHT}>
        <Defs>
          <RadialGradient id={`halo${tone}`} cx="0.5" cy="0.25" r="0.45">
            <Stop offset="0" stopColor={p.halo} stopOpacity="0.45" />
            <Stop offset="1" stopColor={p.halo} stopOpacity="0" />
          </RadialGradient>
        </Defs>
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
        <Rect width="100%" height="100%" fill={`url(#halo${tone})`} />
        {[
          { w: 14, o: 0.15 },
          { w: 7, o: 0.35 },
          { w: 2.5, o: 1 },
        ].map((s, i) => (
          <Path
            key={i}
            d="M180 70 V230 M135 115 H225"
            stroke={i === 2 ? p.cross[1] : p.cross[0]}
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
              color: p.ink,
              textAlign: 'center',
            },
            glow,
          ]}>
          {text}
        </Text>
        <Text
          style={[
            { fontFamily: 'Caveat_700Bold', fontSize: 28, color: p.ink, textAlign: 'center', marginTop: 18 },
            glow,
          ]}>
          {reference}
        </Text>
      </View>
      <Brand color={p.ink} />
    </View>
  );
}

const styles = StyleSheet.create({
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
  refCaps: { fontFamily: 'Archivo_700Bold', fontSize: 13, letterSpacing: 2 },
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
  papelRef: { fontFamily: 'Archivo_800ExtraBold', fontSize: 16 },
  neonBody: { position: 'absolute', left: 26, right: 26, top: 250, bottom: 90, justifyContent: 'center' },
});
