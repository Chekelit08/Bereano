import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Escena, useEntrada, useVertical } from '../partes/Escena';
import { C, UI } from '../tema';
import { VOZ } from '../voz';

const DIAS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

/** La semana que arranca bien (✓ ✓ ✓) y se corta: los días siguientes se tachan con una sacudida. */
export function Gancho({ corte = 3.36 }: { corte?: number }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const vertical = useVertical();
  const entra = useEntrada(2);
  const d = vertical ? 116 : 98;
  const sacude = t > corte && t < corte + 0.5 ? Math.sin(t * 70) * 14 * (1 - (t - corte) / 0.5) : 0;
  return (
    <Escena
      palabras={VOZ.gancho.palabras}
      destacar={['dejaste']}
      visual={
        <div style={{ marginTop: vertical ? 280 : 0, transform: `translateX(${sacude}px) scale(${entra})` }}>
          <div style={{ display: 'flex', gap: vertical ? 20 : 16 }}>
            {DIAS.map((dia, i) => {
              const hecho = i < 3;
              const s = spring({ frame: f - (0.6 + i * 0.35) * fps, fps, config: { damping: 9, stiffness: 200 } });
              const x = spring({ frame: f - (corte + (i - 3) * 0.08) * fps, fps, config: { damping: 9, stiffness: 220 } });
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontFamily: UI, fontWeight: 800, fontSize: 32, color: C.muted }}>{dia}</span>
                  <div
                    style={{
                      width: d,
                      height: d,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: hecho ? C.blue : interpolate(x, [0, 1], [0, 1]) > 0.5 ? '#FFE3E3' : '#fff',
                      border: hecho ? 'none' : `4px solid ${x > 0.5 ? '#FA5252' : '#E5E5EA'}`,
                      boxShadow: hecho ? `0 14px 30px ${C.blue}55` : 'none',
                      transform: `scale(${hecho ? s : 1})`,
                      color: hecho ? '#fff' : '#FA5252',
                      fontFamily: UI,
                      fontWeight: 900,
                      fontSize: d * 0.46,
                    }}>
                    {hecho ? '✓' : <span style={{ transform: `scale(${x})`, display: 'inline-block' }}>✕</span>}
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
