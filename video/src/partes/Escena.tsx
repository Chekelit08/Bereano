import type { ReactNode } from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { Palabra } from '../voz';
import { C } from '../tema';
import { Fondo } from './Fondo';
import { Frase } from './Frase';

export const useVertical = () => {
  const { width, height } = useVideoConfig();
  return height > width;
};

/** Entrada suave (resorte sin rebote) para el bloque visual de cada escena. */
export function useEntrada(delay = 0) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config: { damping: 200, mass: 0.8 } });
}

/**
 * Escena: la frase arriba (vertical) o a la izquierda (horizontal) y lo visual en el resto.
 * Sale con un fundido corto en los últimos 6 cuadros para que el corte no sea seco.
 */
export function Escena({
  palabras,
  destacar,
  visual,
  oscuro = false,
}: {
  palabras: Palabra[];
  destacar?: string[];
  visual: ReactNode;
  oscuro?: boolean;
}) {
  const vertical = useVertical();
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const salida = interpolate(f, [durationInFrames - 6, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const entrada = interpolate(f, [0, 6], [0, 1], { extrapolateRight: 'clamp' });
  const frase = (
    <Frase
      palabras={palabras}
      size={vertical ? 80 : 80}
      destacar={destacar}
      color={oscuro ? '#fff' : C.text}
      dim={oscuro ? '#ffffff40' : '#1D1D1F2E'}
      acento={oscuro ? '#9FD0FF' : C.blue}
    />
  );
  return (
    <AbsoluteFill>
      <Fondo oscuro={oscuro} />
      <AbsoluteFill style={{ opacity: Math.min(salida, entrada) }}>
        {vertical ? (
          <>
            <div style={{ position: 'absolute', left: 96, right: 96, top: 170 }}>{frase}</div>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 740, bottom: 0, display: 'flex', justifyContent: 'center' }}>
              {visual}
            </div>
          </>
        ) : (
          <>
            <div style={{ position: 'absolute', left: 140, width: 860, top: 0, bottom: 0, display: 'flex', alignItems: 'center' }}>
              {frase}
            </div>
            <div style={{ position: 'absolute', left: 1040, right: 60, top: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {visual}
            </div>
          </>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
