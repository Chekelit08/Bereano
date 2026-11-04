import { Img, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Escena, useVertical } from '../partes/Escena';
import { C, UI } from '../tema';
import { VOZ } from '../voz';

/** El logo entra con un resorte apenas se dice "Bereano". */
export function Promesa() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const vertical = useVertical();
  const s = spring({ frame: f - 2, fps, config: { damping: 14, stiffness: 120 } });
  const nombre = spring({ frame: f - 10, fps, config: { damping: 200 } });
  const tam = vertical ? 300 : 280;
  return (
    <Escena
      palabras={VOZ.promesa.palabras}
      destacar={['entender', 'leés']}
      visual={
        <div style={{ marginTop: vertical ? 200 : 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
          <Img
            src={staticFile('logo.svg')}
            style={{ width: tam, height: tam, transform: `scale(${s}) rotate(${(1 - s) * -12}deg)`, filter: 'drop-shadow(0 40px 60px #0071E355)' }}
          />
          <span
            style={{
              fontFamily: UI,
              fontWeight: 800,
              fontSize: 96,
              letterSpacing: '-0.04em',
              color: C.text,
              opacity: nombre,
              transform: `translateY(${(1 - nombre) * 30}px)`,
            }}>
            Bereano
          </span>
        </div>
      }
    />
  );
}
