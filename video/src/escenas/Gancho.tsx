import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { Escena, useEntrada, useVertical } from '../partes/Escena';
import { C, UI } from '../tema';
import { VOZ } from '../voz';

const DIAS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

/** La semana que empieza bien y se corta: tres días hechos y el resto se apaga. */
export function Gancho() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const vertical = useVertical();
  const entra = useEntrada(4);
  const d = vertical ? 112 : 96;
  return (
    <Escena
      palabras={VOZ.gancho.palabras}
      destacar={['dejaste']}
      visual={
        <div style={{ marginTop: vertical ? 260 : 0, opacity: entra, transform: `translateY(${(1 - entra) * 60}px)` }}>
          <div style={{ display: 'flex', gap: vertical ? 22 : 18 }}>
            {DIAS.map((dia, i) => {
              const hecho = i < 3;
              const marca = interpolate(t, [0.8 + i * 0.45, 1.05 + i * 0.45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
              const apaga = interpolate(t, [3.0 + (i - 3) * 0.12, 3.4 + (i - 3) * 0.12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontFamily: UI, fontWeight: 700, fontSize: 30, color: C.muted }}>{dia}</span>
                  <div
                    style={{
                      width: d,
                      height: d,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: hecho ? `rgba(0,113,227,${marca})` : C.surface,
                      border: hecho ? 'none' : `3px dashed rgba(134,134,139,${0.25 + apaga * 0.5})`,
                      transform: `scale(${hecho ? 0.85 + marca * 0.15 : 1 - apaga * 0.08})`,
                      color: '#fff',
                      fontFamily: UI,
                      fontWeight: 800,
                      fontSize: d * 0.42,
                    }}>
                    {hecho && marca > 0.5 ? '✓' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      }
    />
  );
}
