import type { ReactNode } from 'react';
import { C } from '../tema';

/** Marco de iPhone simple (sin marca) con la pantalla de 390×844 puntos escalada a `ancho`. */
export function Telefono({ ancho, children }: { ancho: number; children: ReactNode }) {
  const k = ancho / 430;
  const pantallaAncho = 390 * k;
  return (
    <div
      style={{
        width: ancho,
        height: 904 * k,
        borderRadius: 72 * k,
        background: '#111',
        padding: 20 * k,
        boxShadow: `0 ${50 * k}px ${120 * k}px #0B1F4D40, 0 0 0 ${3 * k}px #2a2a2e inset`,
        position: 'relative',
      }}>
      <div
        style={{
          width: pantallaAncho,
          height: 864 * k,
          borderRadius: 54 * k,
          overflow: 'hidden',
          background: C.bg,
          position: 'relative',
        }}>
        {children}
        <div
          style={{
            position: 'absolute',
            top: 12 * k,
            left: '50%',
            width: 120 * k,
            height: 34 * k,
            marginLeft: -60 * k,
            borderRadius: 20 * k,
            background: '#000',
          }}
        />
      </div>
    </div>
  );
}

/** Ancho de pantalla en px para un teléfono de `ancho`. */
export const pantalla = (ancho: number) => (ancho / 430) * 390;
