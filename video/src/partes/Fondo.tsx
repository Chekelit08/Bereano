import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from '../tema';

/** Fondo con color y movimiento: gradiente que gira, luces que laten con la música y destellos que flotan. */
export function Fondo({ oscuro = false }: { oscuro?: boolean }) {
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const beat = Math.pow(1 - ((f / fps) * 2) % 1, 3); // pulso a 120 bpm
  const giro = f * 0.6;
  const base = oscuro
    ? `linear-gradient(${150 + giro / 6}deg, #0058C7, ${C.blue} 45%, #5B3DF5)`
    : `linear-gradient(${150 + giro / 6}deg, #EEF5FF, #FFFFFF 45%, #F2ECFF)`;
  const luz = (x: number, y: number, r: number, col: string, op: number) => (
    <div
      style={{
        position: 'absolute',
        width: r,
        height: r,
        left: x - r / 2,
        top: y - r / 2,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${col} 0%, transparent 65%)`,
        opacity: op * (0.85 + beat * 0.15),
        transform: `scale(${1 + beat * 0.04})`,
      }}
    />
  );
  return (
    <AbsoluteFill style={{ background: base, overflow: 'hidden' }}>
      {luz(width * 0.85 + Math.sin(f / 40) * 120, height * 0.12 + Math.cos(f / 50) * 80, 1300, oscuro ? '#9FD0FF' : '#4DABF7', oscuro ? 0.45 : 0.45)}
      {luz(width * 0.1 + Math.cos(f / 45) * 140, height * 0.9 + Math.sin(f / 38) * 90, 1200, oscuro ? '#B197FC' : '#B197FC', oscuro ? 0.5 : 0.35)}
      {Array.from({ length: 9 }).map((_, i) => {
        const x = ((i * 397) % 100) / 100;
        const vel = 0.6 + (i % 4) * 0.25;
        const y = ((i * 211) % 100) / 100 - ((f * vel) / height) * 1.5;
        const yy = ((y % 1) + 1) % 1;
        const tam = 18 + (i % 3) * 14;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x * width,
              top: yy * height,
              fontSize: tam,
              color: oscuro ? '#ffffff' : C.blue,
              opacity: interpolate(Math.sin(f / 12 + i), [-1, 1], [0.15, 0.55]),
              transform: `rotate(${f * (i % 2 ? 2 : -2)}deg)`,
            }}>
            ✦
          </div>
        );
      })}
    </AbsoluteFill>
  );
}
