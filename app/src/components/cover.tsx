import { useSvgId } from '@/lib/svg-id';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

/** Tapa de un plan o un tema: degradé con formas suaves y el título en serif grande. */
export function Cover({
  id,
  title,
  kicker,
  colors,
  size = 160,
  ratio = 1,
}: {
  id: string;
  title: string;
  kicker?: string;
  colors: [string, string];
  size?: number;
  ratio?: number;
}) {
  const gid = `cv${useSvgId()}`;
  const w = size;
  const h = size * ratio;
  const seed = [...id].reduce((a, ch) => a + ch.charCodeAt(0), 0);
  const fs = Math.max(16, Math.min(size / 6.2, (w * 1.6) / Math.max(title.length, 4)));
  return (
    <View style={{ width: w, height: h, borderRadius: Math.max(12, size / 12), overflow: 'hidden' }}>
      <Svg style={StyleSheet.absoluteFill} width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <Defs>
          <LinearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors[0]} />
            <Stop offset="1" stopColor={colors[1]} />
          </LinearGradient>
        </Defs>
        <Rect width={w} height={h} fill={`url(#${gid})`} />
        <Circle
          cx={w * (0.75 + (seed % 3) * 0.05)}
          cy={h * 0.22}
          r={w * 0.38}
          fill="#ffffff"
          opacity={0.12}
        />
        <Circle cx={w * 0.1} cy={h * (0.9 - (seed % 4) * 0.04)} r={w * 0.32} fill="#000000" opacity={0.08} />
        <Path
          d={`M0 ${h * 0.72} C ${w * 0.35} ${h * 0.6}, ${w * 0.65} ${h * 0.86}, ${w} ${h * 0.7} L ${w} ${h} L 0 ${h} Z`}
          fill="#ffffff"
          opacity={0.1}
        />
      </Svg>
      <View style={styles.body}>
        {kicker && <Text style={[styles.kicker, { fontSize: Math.max(10, size / 16) }]}>{kicker}</Text>}
        {/* En tapas chicas va solo la inicial: el título completo no se lee. */}
        <Text
          style={[
            styles.title,
            { fontSize: size < 100 ? size * 0.42 : fs, lineHeight: (size < 100 ? size * 0.42 : fs) * 1.08 },
          ]}
          numberOfLines={3}>
          {size < 100 ? title.replace(/^(El|La|Los|Las)\s+/i, '').charAt(0) : title}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'flex-end', padding: '9%' },
  kicker: {
    fontFamily: 'Inter_600SemiBold',
    color: '#ffffff',
    opacity: 0.85,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: { fontFamily: 'DMSerifDisplay_400Regular', color: '#ffffff' },
});
