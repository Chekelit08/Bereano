import { StyleSheet, Text, View, type TextStyle } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { Brand, CARD_HEIGHT, CARD_WIDTH, cardStyles, fit, keyword, type CardProps } from './base';

const DISPLAY = 'DMSerifDisplay_400Regular';
const DISPLAY_ITALIC = 'DMSerifDisplay_400Regular_Italic';
const CONDENSED = 'BebasNeue_400Regular';

// ---------- Minimal: una sola tipografía, mucho aire ----------

const MINIMAL = [
  { bg: '#ffffff', ink: '#111111', muted: '#8a8a8e', accent: '#0071e3' },
  { bg: '#0b0b0c', ink: '#f5f5f7', muted: '#8e8e93', accent: '#2997ff' },
  { bg: '#f1ece4', ink: '#2b2722', muted: '#8b8174', accent: '#b5532d' },
];

export function Minimal({ text, reference, tone, ref }: CardProps) {
  const p = MINIMAL[tone] ?? MINIMAL[0];
  const fs = fit(text, 26);
  return (
    <View ref={ref} collapsable={false} style={[cardStyles.card, styles.minimal, { backgroundColor: p.bg }]}>
      <View>
        <View style={{ width: 28, height: 3, backgroundColor: p.accent }} />
        <Text style={[styles.caps, { color: p.muted, marginTop: 14 }]}>{reference}</Text>
      </View>
      <Text
        style={{
          fontFamily: 'Inter_600SemiBold',
          fontSize: fs,
          lineHeight: fs * 1.28,
          letterSpacing: -0.5,
          color: p.ink,
        }}>
        {text}
      </Text>
      <View style={styles.minimalFoot}>
        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: p.ink }}>Bereano</Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: p.muted }}>
          Reina-Valera 1909
        </Text>
      </View>
    </View>
  );
}

// ---------- Gigante: una palabra enorme y el versículo debajo ----------

const GIGANTE = [
  { bg: '#0a3cff', ink: '#ffffff', word: '#ffd84d' },
  { bg: '#ff5a3c', ink: '#ffffff', word: '#1b0f0b' },
  { bg: '#ffd84d', ink: '#141414', word: '#141414' },
];

export function Gigante({ text, reference, marks, tone, ref }: CardProps) {
  const p = GIGANTE[tone] ?? GIGANTE[0];
  const word = keyword(text, marks).toUpperCase();
  // Bebas es angosta: cada letra ocupa ~0,42 de su tamaño.
  const wordSize = Math.min(text.length > 200 ? 110 : 170, 304 / (Math.max(word.length, 3) * 0.42));
  const fs = Math.max(16, fit(text, 20));
  return (
    <View ref={ref} collapsable={false} style={[cardStyles.card, { backgroundColor: p.bg }]}>
      <View style={styles.giganteBody}>
        <Text style={[styles.caps, { color: p.ink, opacity: 0.8 }]}>Versículo del día</Text>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: CONDENSED,
            fontSize: wordSize,
            lineHeight: wordSize * 1.02,
            color: p.word,
            marginTop: 8,
          }}>
          {word}
        </Text>
        <View style={{ height: 2, backgroundColor: p.ink, opacity: 0.85, marginVertical: 18 }} />
        <Text style={{ fontFamily: 'Inter_500Medium', fontSize: fs, lineHeight: fs * 1.4, color: p.ink }}>
          {text}
        </Text>
        <Text style={{ fontFamily: CONDENSED, fontSize: 24, letterSpacing: 1, color: p.ink, marginTop: 16 }}>
          {reference}
        </Text>
      </View>
      <Brand color={p.ink} />
    </View>
  );
}

// ---------- Acuarela: manchas suaves y serif ----------

const ACUARELA = [
  { bg: '#fbf4ee', ink: '#3a2a2a', blobs: ['#f7a8a0', '#ffd0a6', '#f4b8d4', '#ffe3b3'] },
  { bg: '#f1f7f6', ink: '#1f3438', blobs: ['#9fd6e8', '#b6ecd2', '#c9d8ff', '#d9f3e8'] },
  { bg: '#f6f2fa', ink: '#30264a', blobs: ['#c9b6f2', '#f2c1e0', '#b9c8f5', '#efd9ff'] },
];
const BLOBS = [
  { cx: 70, cy: 110, rx: 170, ry: 140 },
  { cx: 320, cy: 230, rx: 150, ry: 170 },
  { cx: 60, cy: 520, rx: 180, ry: 150 },
  { cx: 300, cy: 600, rx: 160, ry: 120 },
];

export function Acuarela({ text, reference, tone, ref }: CardProps) {
  const p = ACUARELA[tone] ?? ACUARELA[0];
  const fs = fit(text, 29);
  return (
    <View ref={ref} collapsable={false} style={[cardStyles.card, { backgroundColor: p.bg }]}>
      <Svg style={StyleSheet.absoluteFill} width={CARD_WIDTH} height={CARD_HEIGHT}>
        <Defs>
          {BLOBS.map((_, i) => (
            <RadialGradient key={i} id={`blob${tone}-${i}`} cx="0.5" cy="0.5" r="0.5">
              <Stop offset="0" stopColor={p.blobs[i]} stopOpacity="0.9" />
              <Stop offset="0.6" stopColor={p.blobs[i]} stopOpacity="0.45" />
              <Stop offset="1" stopColor={p.blobs[i]} stopOpacity="0" />
            </RadialGradient>
          ))}
        </Defs>
        {BLOBS.map((b, i) => (
          <Rect
            key={i}
            x={b.cx - b.rx}
            y={b.cy - b.ry}
            width={b.rx * 2}
            height={b.ry * 2}
            fill={`url(#blob${tone}-${i})`}
          />
        ))}
      </Svg>
      <View style={styles.centerBody}>
        <Text
          style={{
            fontFamily: DISPLAY,
            fontSize: fs,
            lineHeight: fs * 1.25,
            color: p.ink,
            textAlign: 'center',
          }}>
          {text}
        </Text>
        <Text
          style={{ fontFamily: DISPLAY_ITALIC, fontSize: 20, color: p.ink, marginTop: 22, opacity: 0.85 }}>
          {reference}
        </Text>
      </View>
      <Brand color={p.ink} />
    </View>
  );
}

// ---------- Clásico: doble marco y ornamentos ----------

const MARCO = [
  { bg: '#f4efe4', ink: '#2f3b2f', line: '#6f7d5c' },
  { bg: '#121212', ink: '#e9d9a6', line: '#c8a85a' },
  { bg: '#5a1424', ink: '#f6e7cf', line: '#e0b97a' },
];

function Diamond({ x, y, color, s = 5 }: { x: number; y: number; color: string; s?: number }) {
  return <Path d={`M${x} ${y - s} L${x + s} ${y} L${x} ${y + s} L${x - s} ${y} Z`} fill={color} />;
}

export function Marco({ text, reference, tone, ref }: CardProps) {
  const p = MARCO[tone] ?? MARCO[0];
  const fs = fit(text, 26);
  const corners = [
    [18, 18],
    [CARD_WIDTH - 18, 18],
    [18, CARD_HEIGHT - 18],
    [CARD_WIDTH - 18, CARD_HEIGHT - 18],
  ];
  return (
    <View ref={ref} collapsable={false} style={[cardStyles.card, { backgroundColor: p.bg }]}>
      <Svg style={StyleSheet.absoluteFill} width={CARD_WIDTH} height={CARD_HEIGHT}>
        <Rect
          x={18}
          y={18}
          width={CARD_WIDTH - 36}
          height={CARD_HEIGHT - 36}
          stroke={p.line}
          strokeWidth={1.5}
          fill="none"
        />
        <Rect
          x={26}
          y={26}
          width={CARD_WIDTH - 52}
          height={CARD_HEIGHT - 52}
          stroke={p.line}
          strokeWidth={0.75}
          fill="none"
        />
        {corners.map(([x, y], i) => (
          <Diamond key={i} x={x} y={y} color={p.line} />
        ))}
        <G>
          <Path d="M120 92 H168 M192 92 H240" stroke={p.line} strokeWidth={1} />
          <Diamond x={180} y={92} color={p.line} s={6} />
        </G>
      </Svg>
      <View style={[styles.centerBody, { top: 110, bottom: 140, left: 46, right: 46 }]}>
        <Text
          style={{
            fontFamily: 'Newsreader_500Medium',
            fontSize: fs,
            lineHeight: fs * 1.35,
            color: p.ink,
            textAlign: 'center',
          }}>
          {text}
        </Text>
        <View style={[styles.rule, { backgroundColor: p.line }]} />
        <Text style={{ fontFamily: 'Newsreader_400Regular_Italic', fontSize: 19, color: p.ink }}>
          {reference}
        </Text>
      </View>
      <Brand color={p.ink} bottom={50} />
    </View>
  );
}

// ---------- Dividido: la cita gigante arriba, el texto abajo ----------

const DIVIDIDO = [
  { top: '#0a3cff', topInk: '#ffffff', bg: '#ffffff', ink: '#16181d' },
  { top: '#3e5a3a', topInk: '#f3efe6', bg: '#f3efe6', ink: '#1f261d' },
  { top: '#c4562f', topInk: '#fff4ec', bg: '#f7efe7', ink: '#2b1a12' },
];

export function Dividido({ text, reference, tone, ref }: CardProps) {
  const p = DIVIDIDO[tone] ?? DIVIDIDO[0];
  const cut = reference.lastIndexOf(' ');
  const book = cut > 0 ? reference.slice(0, cut) : reference;
  const where = cut > 0 ? reference.slice(cut + 1) : '';
  const bookSize = Math.min(50, 300 / (book.length * 0.5));
  const whereSize = Math.min(118, 300 / (Math.max(where.length, 3) * 0.42));
  const fs = Math.max(16, fit(text, 22));
  return (
    <View ref={ref} collapsable={false} style={[cardStyles.card, { backgroundColor: p.bg }]}>
      <View style={[styles.dividedTop, { backgroundColor: p.top }]}>
        <Text style={{ fontFamily: DISPLAY_ITALIC, fontSize: bookSize, color: p.topInk }}>{book}</Text>
        {!!where && (
          <Text
            style={{ fontFamily: CONDENSED, fontSize: whereSize, lineHeight: whereSize, color: p.topInk }}>
            {where}
          </Text>
        )}
      </View>
      <View style={styles.dividedBody}>
        <Text style={{ fontFamily: 'Literata_400Regular', fontSize: fs, lineHeight: fs * 1.5, color: p.ink }}>
          {text}
        </Text>
      </View>
      <Brand color={p.ink} bottom={30} />
    </View>
  );
}

// ---------- Cuaderno: hoja rayada, letra a mano y cinta ----------

const CUADERNO = [
  { paper: '#fbfaf6', line: '#bcd3ef', margin: '#f08c8c', ink: '#1d3fbf', tape: '#f3e2a0' },
  { paper: '#fff4c2', line: '#e3cf83', margin: '#e58f6b', ink: '#222222', tape: '#bfe3f0' },
  { paper: '#dcc29b', line: '#c2a678', margin: '#a0523a', ink: '#3b2a1a', tape: '#f4efe6' },
];
const LINE = 32;
const FIRST_LINE = 118;

export function Cuaderno({ text, reference, tone, ref }: CardProps) {
  const p = CUADERNO[tone] ?? CUADERNO[0];
  const fs = Math.min(30, fit(text, 27));
  const lines = Array.from({ length: 16 }, (_, i) => FIRST_LINE + i * LINE);
  return (
    <View ref={ref} collapsable={false} style={[cardStyles.card, { backgroundColor: p.paper }]}>
      <Svg style={StyleSheet.absoluteFill} width={CARD_WIDTH} height={CARD_HEIGHT}>
        {lines.map((y) => (
          <Path key={y} d={`M0 ${y} H${CARD_WIDTH}`} stroke={p.line} strokeWidth={1} />
        ))}
        <Path d={`M52 0 V${CARD_HEIGHT}`} stroke={p.margin} strokeWidth={1.2} />
        <Rect
          x={130}
          y={-12}
          width={100}
          height={42}
          fill={p.tape}
          opacity={0.85}
          transform="rotate(-4 180 10)"
        />
      </Svg>
      {/* El texto cae sobre los renglones: el alto de línea es el mismo que el rayado. */}
      <View style={{ position: 'absolute', left: 66, right: 26, top: FIRST_LINE - LINE + 13 }}>
        <Text style={{ fontFamily: 'Caveat_700Bold', fontSize: fs, lineHeight: LINE, color: p.ink }}>
          {text}
        </Text>
        <Text
          style={{
            fontFamily: 'Caveat_700Bold',
            fontSize: 26,
            lineHeight: LINE * 1.5,
            color: p.ink,
            textAlign: 'right',
            marginTop: LINE / 2,
          }}>
          — {reference}
        </Text>
      </View>
      <Brand color={p.ink} bottom={26} />
    </View>
  );
}

// ---------- Atardecer: sol retro a rayas sobre el horizonte ----------

const ATARDECER = [
  {
    sky: ['#2b1b4a', '#7a2f5e'],
    sun: ['#ffd27a', '#ff6a3d'],
    bands: ['#ff7a45', '#e9566a', '#b8407a', '#7d2f78', '#4a2466'],
    ink: '#ffffff',
  },
  {
    sky: ['#cfe8ff', '#ffd9e4'],
    sun: ['#fff1c4', '#ff9fb8'],
    bands: ['#ffb3c6', '#f79ab4', '#d9a3e0', '#a8b8f0', '#8aa6e8'],
    ink: '#2a2440',
  },
  {
    sky: ['#0d1b3a', '#3c2a6e'],
    sun: ['#ffe3a3', '#ff8fa3'],
    bands: ['#6a3fa0', '#55358c', '#3f2a78', '#2b2064', '#1b1650'],
    ink: '#ffffff',
  },
];

export function Atardecer({ text, reference, tone, ref }: CardProps) {
  const p = ATARDECER[tone] ?? ATARDECER[0];
  const fs = Math.max(16, fit(text, 22));
  const horizon = 470;
  const bandH = (CARD_HEIGHT - horizon) / p.bands.length;
  return (
    <View ref={ref} collapsable={false} style={cardStyles.card}>
      <Svg style={StyleSheet.absoluteFill} width={CARD_WIDTH} height={CARD_HEIGHT}>
        <Defs>
          <LinearGradient id={`dusk${tone}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={p.sky[0]} />
            <Stop offset="1" stopColor={p.sky[1]} />
          </LinearGradient>
          <LinearGradient id={`sol${tone}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={p.sun[0]} />
            <Stop offset="1" stopColor={p.sun[1]} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#dusk${tone})`} />
        <Circle cx={180} cy={horizon} r={110} fill={`url(#sol${tone})`} />
        {/* Rayas que cortan el sol, cada vez más gruesas */}
        {[0, 1, 2, 3, 4].map((i) => (
          <Rect key={i} x={60} y={horizon - 46 + i * 9} width={240} height={1.5 + i * 1.3} fill={p.sky[1]} />
        ))}
        {p.bands.map((color, i) => (
          <Rect
            key={color}
            x={0}
            y={horizon + i * bandH}
            width={CARD_WIDTH}
            height={bandH + 1}
            fill={color}
          />
        ))}
      </Svg>
      <View style={[styles.centerBody, { top: 60, bottom: CARD_HEIGHT - horizon + 130 }]}>
        <Text
          style={{
            fontFamily: 'Inter_700Bold',
            fontSize: fs,
            lineHeight: fs * 1.3,
            letterSpacing: -0.3,
            color: p.ink,
            textAlign: 'center',
          }}>
          {text}
        </Text>
        <Text style={[styles.caps, { color: p.ink, marginTop: 16, opacity: 0.9 }]}>{reference}</Text>
      </View>
      <Brand color={p.ink} bottom={28} />
    </View>
  );
}

// ---------- Tipográfico: las palabras importantes en otra letra ----------

const TIPO = [
  { bg: '#111111', ink: '#f5f5f5', accent: '#ffd84d' },
  { bg: '#f3ede2', ink: '#1b1b1b', accent: '#e0412b' },
  { bg: '#0a3cff', ink: '#ffffff', accent: '#9fe8ff' },
];

export function Tipografico({ text, reference, marks, tone, ref }: CardProps) {
  const p = TIPO[tone] ?? TIPO[0];
  const fs = fit(text, 24);
  const letters = (w: string) => w.replace(/[^\p{L}]/gu, '').length;
  let long = 0;
  return (
    <View ref={ref} collapsable={false} style={[cardStyles.card, { backgroundColor: p.bg }]}>
      <View style={[styles.centerBody, { top: 70, bottom: 150 }]}>
        <View style={styles.wordsCenter}>
          {text.split(' ').map((w, i) => {
            const base: TextStyle = {
              fontFamily: 'Inter_500Medium',
              fontSize: fs,
              lineHeight: fs * 1.45,
              color: p.ink,
            };
            let style: TextStyle = base;
            // Con marcas del devocional: negrita → condensada, cursiva → serif. Sin marcas: palabras largas.
            const strong = marks
              ? marks.bold?.includes(w) || w === marks.circle
              : letters(w) >= 7 && long++ % 2 === 0;
            const soft = marks ? marks.italic?.includes(w) : !strong && letters(w) >= 7;
            if (strong)
              style = {
                ...base,
                fontFamily: CONDENSED,
                fontSize: fs * 1.75,
                color: p.accent,
                letterSpacing: 0.5,
              };
            else if (soft) style = { ...base, fontFamily: DISPLAY_ITALIC, fontSize: fs * 1.25 };
            return (
              <Text key={i} style={[style, { marginHorizontal: fs * 0.13 }]}>
                {strong ? w.toUpperCase() : w}
              </Text>
            );
          })}
        </View>
        <Text style={[styles.caps, { color: p.accent, marginTop: 22 }]}>{reference}</Text>
      </View>
      <Brand color={p.ink} />
    </View>
  );
}

const styles = StyleSheet.create({
  caps: { fontFamily: 'Inter_600SemiBold', fontSize: 12, letterSpacing: 2.2, textTransform: 'uppercase' },
  minimal: { paddingHorizontal: 34, paddingTop: 64, paddingBottom: 40, justifyContent: 'space-between' },
  minimalFoot: { gap: 2 },
  giganteBody: { position: 'absolute', left: 28, right: 28, top: 70, bottom: 120, justifyContent: 'center' },
  centerBody: {
    position: 'absolute',
    left: 32,
    right: 32,
    top: 70,
    bottom: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rule: { width: 40, height: 1, marginVertical: 20 },
  dividedTop: { height: 270, paddingHorizontal: 30, paddingBottom: 18, justifyContent: 'flex-end' },
  dividedBody: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 28,
    paddingBottom: 90,
    justifyContent: 'center',
  },
  wordsCenter: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'baseline' },
});
