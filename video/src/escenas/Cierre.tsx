import { Img, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Escena, useVertical } from '../partes/Escena';
import { C, UI } from '../tema';
import { VOZ } from '../voz';

/** Fondo azul, "gratis, siempre" y el llamado final con el logo cuando la voz dice "Probá Bereano hoy". */
export function Cierre() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const vertical = useVertical();
  const logo = spring({ frame: f - 4.9 * fps, fps, config: { damping: 9, stiffness: 140 } });
  const cta = spring({ frame: f - 5.3 * fps, fps, config: { damping: 10, stiffness: 160 } });
  const late = 1 + Math.pow(1 - ((f / fps) * 2) % 1, 3) * 0.05 * cta;
  return (
    <Escena
      oscuro
      palabras={VOZ.cierre.palabras}
      destacar={['gratis', 'siempre']}
      visual={
        <div style={{ marginTop: vertical ? 260 : 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28, transform: `scale(${logo})` }}>
            <Img src={staticFile('logo.svg')} style={{ width: 150, height: 150, borderRadius: 34, boxShadow: '0 0 0 5px #ffffff55' }} />
            <span style={{ fontFamily: UI, fontWeight: 800, fontSize: 104, letterSpacing: '-0.04em', color: '#fff' }}>Bereano</span>
          </div>
          <div
            style={{
              fontFamily: UI,
              fontWeight: 800,
              fontSize: 44,
              color: C.blue,
              background: '#fff',
              padding: '24px 48px',
              borderRadius: 999,
              opacity: cta,
              transform: `scale(${cta * late})`,
              boxShadow: '0 20px 50px #00000040',
            }}>
            Probalo gratis
          </div>
          <span style={{ fontFamily: UI, fontWeight: 600, fontSize: 30, color: '#ffffffcc', opacity: cta }}>
            bereano.ezeadenett.workers.dev
          </span>
        </div>
      }
    />
  );
}
