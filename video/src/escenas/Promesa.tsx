import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Escena, useVertical } from '../partes/Escena';
import { C, UI } from '../tema';
import { VOZ } from '../voz';

/** El logo explota en escena con anillos de luz cuando la voz dice "Bereano". */
export function Promesa() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const vertical = useVertical();
  const s = spring({ frame: f - 2, fps, config: { damping: 8, stiffness: 140 } });
  const nombre = spring({ frame: f - 8, fps, config: { damping: 12, stiffness: 150 } });
  const tam = vertical ? 320 : 290;
  return (
    <Escena
      palabras={VOZ.promesa.palabras}
      destacar={['entender']}
      visual={
        <div style={{ marginTop: vertical ? 180 : 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40, position: 'relative' }}>
          {[0, 1, 2].map((i) => {
            const r = interpolate((f - i * 14) % 45, [0, 45], [0.6, 2.2]);
            const o = interpolate((f - i * 14) % 45, [0, 45], [0.5, 0]);
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: tam / 2 - tam / 2,
                  width: tam,
                  height: tam,
                  borderRadius: '30%',
                  border: `6px solid ${C.blue}`,
                  opacity: f > i * 14 ? o : 0,
                  transform: `scale(${r})`,
                }}
              />
            );
          })}
          <Img
            src={staticFile('logo.svg')}
            style={{ width: tam, height: tam, transform: `scale(${s}) rotate(${(1 - s) * -30}deg)`, filter: 'drop-shadow(0 40px 60px #0071E366)' }}
          />
          <span style={{ fontFamily: UI, fontWeight: 900, fontSize: 104, letterSpacing: '-0.045em', color: C.text, transform: `scale(${nombre})` }}>
            Bereano
          </span>
        </div>
      }
    />
  );
}
