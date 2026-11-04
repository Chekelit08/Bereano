import type { ReactNode } from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import type { Palabra } from '../voz';
import { C } from '../tema';
import { Fondo } from './Fondo';
import { Frase } from './Frase';

export const useVertical = () => {
  const { width, height } = useVideoConfig();
  return height > width;
};

/** Entrada con rebote para lo visual de cada escena. */
export function useEntrada(delay = 0) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config: { damping: 13, stiffness: 120, mass: 0.9 } });
}

/** Barrido de color entre escenas: un panel azul cruza la pantalla en diagonal. */
function Barrido() {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const entra = interpolate(f, [0, 9], [0, 120], { extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic) });
  const sale = interpolate(f, [durationInFrames - 7, durationInFrames], [-120, 0], { extrapolateLeft: 'clamp', easing: Easing.out(Easing.cubic) });
  const panel = (x: number, col: string) => (
    <div style={{ position: 'absolute', inset: '-30%', background: col, transform: `translateX(${x}%) skewX(-14deg)` }} />
  );
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {f < 10 && panel(entra, C.blue)}
      {f >= durationInFrames - 7 && panel(sale, C.blue)}
    </AbsoluteFill>
  );
}

/**
 * Escena: frase cinética arriba (vertical) o a la izquierda (horizontal), lo visual en el resto,
 * entrada con zoom y barrido azul entre escenas.
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
  const { fps } = useVideoConfig();
  const zoom = spring({ frame: f - 3, fps, config: { damping: 18, stiffness: 140 } });
  const frase = (
    <Frase
      palabras={palabras}
      size={vertical ? 84 : 82}
      destacar={destacar}
      color={oscuro ? '#fff' : C.text}
      pildora={oscuro ? '#FFD43B' : C.blue}
      pildoraTexto={oscuro ? C.text : '#fff'}
    />
  );
  return (
    <AbsoluteFill>
      <Fondo oscuro={oscuro} />
      <AbsoluteFill style={{ transform: `scale(${1.12 - zoom * 0.12})` }}>
        {vertical ? (
          <>
            <div style={{ position: 'absolute', left: 90, right: 90, top: 160 }}>{frase}</div>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 740, bottom: 0, display: 'flex', justifyContent: 'center' }}>
              {visual}
            </div>
          </>
        ) : (
          <>
            <div style={{ position: 'absolute', left: 130, width: 880, top: 0, bottom: 0, display: 'flex', alignItems: 'center' }}>
              {frase}
            </div>
            <div style={{ position: 'absolute', left: 1040, right: 60, top: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {visual}
            </div>
          </>
        )}
      </AbsoluteFill>
      <Barrido />
    </AbsoluteFill>
  );
}
