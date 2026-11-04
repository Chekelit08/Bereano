import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { C } from '../tema';

/** Fondo blanco con dos luces azules suaves que se mueven lento. */
export function Fondo({ oscuro = false }: { oscuro?: boolean }) {
  const f = useCurrentFrame();
  const x = interpolate(f, [0, 600], [0, 120]);
  return (
    <AbsoluteFill style={{ background: oscuro ? `linear-gradient(160deg, ${C.blue}, ${C.blueDark})` : C.bg, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          width: 1400,
          height: 1400,
          borderRadius: '50%',
          right: -600 + x,
          top: -700,
          background: oscuro ? '#ffffff' : C.blue,
          opacity: oscuro ? 0.08 : 0.07,
          filter: 'blur(40px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 1200,
          height: 1200,
          borderRadius: '50%',
          left: -600 - x / 2,
          bottom: -700,
          background: oscuro ? '#000' : '#4DABF7',
          opacity: oscuro ? 0.12 : 0.08,
          filter: 'blur(40px)',
        }}
      />
    </AbsoluteFill>
  );
}
