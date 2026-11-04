import type { ReactNode } from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from '../tema';

/**
 * iPhone simple (sin marca) con la pantalla de 390×844 puntos escalada a `ancho`.
 * Entra girando en 3D y después flota; `zoom` (0–1) lo acerca para mostrar un detalle.
 */
export function Telefono({ ancho, children, zoom = 0 }: { ancho: number; children: ReactNode; zoom?: number }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = ancho / 430;
  const e = spring({ frame: f - 2, fps, config: { damping: 14, stiffness: 90 } });
  const rotY = (1 - e) * -40 + Math.sin(f / 22) * 4;
  const rotX = (1 - e) * 18 + Math.cos(f / 27) * 2;
  const y = (1 - e) * 500 + Math.sin(f / 18) * 10;
  return (
    <div style={{ perspective: 2200 }}>
      <div
        style={{
          width: ancho,
          height: 904 * k,
          borderRadius: 72 * k,
          background: '#111',
          padding: 20 * k,
          boxShadow: `0 ${60 * k}px ${130 * k}px #0B1F4D55, 0 0 0 ${3 * k}px #2a2a2e inset`,
          position: 'relative',
          transform: `translateY(${y}px) rotateY(${rotY}deg) rotateX(${rotX}deg) scale(${1 + zoom * 0.18})`,
          transformOrigin: '50% 30%',
        }}>
        <div style={{ width: (ancho / 430) * 390, height: 864 * k, borderRadius: 54 * k, overflow: 'hidden', background: C.bg, position: 'relative' }}>
          {children}
          <div style={{ position: 'absolute', top: 12 * k, left: '50%', width: 120 * k, height: 34 * k, marginLeft: -60 * k, borderRadius: 20 * k, background: '#000' }} />
        </div>
      </div>
    </div>
  );
}

export const pantalla = (ancho: number) => (ancho / 430) * 390;
