import Svg, { Circle, Path } from 'react-native-svg';

type P = { size?: number; color: string; filled?: boolean };

// Íconos propios, de trazo redondeado, dibujados para Bereano.
export function IconSun({ size = 24, color }: P) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round">
      <Path d="M4 17h16M7 17a5 5 0 0 1 10 0M12 4v3M5.6 8.6l1.8 1.4M18.4 8.6l-1.8 1.4M7 20.5h10" />
    </Svg>
  );
}

export function IconChat({ size = 24, color }: P) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round">
      <Path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4.5 3.5V17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
      <Path d="M8 10.5h8M8 13.5h5" strokeLinecap="round" />
    </Svg>
  );
}

export function IconBook({ size = 24, color }: P) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round">
      <Path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5Z" />
      <Path d="M12 6.5v13" />
    </Svg>
  );
}

export function IconCheck({ size = 24, color, filled }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={1.6} fill={filled ? color : 'none'} />
      {filled && (
        <Path
          d="m7.5 12.2 3 3 6-6.4"
          stroke="#141B2E"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </Svg>
  );
}

export function IconChevron({ size = 18, color }: P) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round">
      <Path d="m9 5 7 7-7 7" />
    </Svg>
  );
}

export function IconFlame({ size = 16, color }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 2c1 3.5-1.5 5-1.5 7.5 0 1.4 1 2.5 2.3 2.5 1.5 0 2.4-1.2 2.2-3C18 11 19 13.5 19 15.5 19 19.6 15.9 22 12 22s-7-2.4-7-6.3C5 10.8 10.2 8.4 12 2Z" />
    </Svg>
  );
}

export function IconSearch({ size = 20, color }: P) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.9}
      strokeLinecap="round">
      <Circle cx="11" cy="11" r="6.5" />
      <Path d="m16 16 4.5 4.5" />
    </Svg>
  );
}

export function IconShare({ size = 18, color }: P) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round">
      <Path d="M12 15V3.5M7.5 8 12 3.5 16.5 8M5 12.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-6.5" />
    </Svg>
  );
}
