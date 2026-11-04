import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Escena, useVertical } from '../partes/Escena';
import { Telefono, pantalla } from '../partes/Telefono';
import { C, UI } from '../tema';
import { VOZ } from '../voz';

// La misma charla de ejemplo que la landing (citas de la Reina-Valera 1909).
const PREGUNTA = '¿Qué significa “bienaventurados los mansos”?';
const RESPUESTA =
  'Ser manso no es ser débil: es tener fuerza y dejar que Dios la guíe. Jesús promete que los mansos “recibirán la tierra por heredad” (Mateo 5:5).';
const CITAS = ['Mateo 5:5', 'Salmos 37:11', 'Mateo 11:29'];

export function Companero() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const vertical = useVertical();
  const ancho = vertical ? 660 : 470;
  const k = pantalla(ancho) / 390;
  const pregunta = spring({ frame: f - 0.5 * fps, fps, config: { damping: 200 } });
  const escribiendo = t > 1.3 && t < 2.7;
  const letras = Math.round(interpolate(t, [2.7, 4.6], [0, RESPUESTA.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const burbuja = { fontFamily: UI, fontSize: 15.5 * k, lineHeight: 1.4, padding: `${11 * k}px ${14 * k}px`, borderRadius: 20 * k };
  return (
    <Escena
      palabras={VOZ.companero.palabras}
      destacar={['verificados']}
      visual={
        <div>
          <Telefono ancho={ancho} zoom={interpolate(t, [4.3, 4.8], [0, 0.8], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
            <div style={{ position: 'absolute', inset: 0, background: '#fff', padding: `${62 * k}px ${16 * k}px`, display: 'flex', flexDirection: 'column', gap: 12 * k }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 * k, paddingBottom: 12 * k, borderBottom: `1px solid #0000001a` }}>
                <Img src={staticFile('logo.svg')} style={{ width: 34 * k, height: 34 * k }} />
                <div style={{ fontFamily: UI }}>
                  <div style={{ fontWeight: 700, fontSize: 17 * k, color: C.text }}>Compañero</div>
                  <div style={{ fontSize: 13 * k, color: C.muted }}>Leyendo Mateo 5</div>
                </div>
              </div>
              <div
                style={{
                  ...burbuja,
                  alignSelf: 'flex-end',
                  maxWidth: '82%',
                  background: C.blue,
                  color: '#fff',
                  opacity: pregunta,
                  transform: `translateY(${(1 - pregunta) * 20 * k}px)`,
                }}>
                {PREGUNTA}
              </div>
              {escribiendo && (
                <div style={{ ...burbuja, alignSelf: 'flex-start', background: C.surface, color: C.muted, letterSpacing: 4 * k }}>
                  {'•••'.slice(0, 1 + (Math.floor(f / 6) % 3))}
                </div>
              )}
              {letras > 0 && (
                <div style={{ ...burbuja, alignSelf: 'flex-start', maxWidth: '88%', background: C.surface, color: C.text }}>
                  {RESPUESTA.slice(0, letras)}
                </div>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 * k }}>
                {CITAS.map((c, i) => {
                  const s = spring({ frame: f - (4.4 + i * 0.25) * fps, fps, config: { damping: 12, stiffness: 160 } });
                  return (
                    <span
                      key={c}
                      style={{
                        fontFamily: UI,
                        fontWeight: 700,
                        fontSize: 13 * k,
                        color: '#0A7A34',
                        background: '#E6F6EC',
                        borderRadius: 999,
                        padding: `${6 * k}px ${11 * k}px`,
                        transform: `scale(${s})`,
                        opacity: Math.min(1, s * 1.5),
                      }}>
                      ✓ {c}
                    </span>
                  );
                })}
              </div>
            </div>
          </Telefono>
        </div>
      }
    />
  );
}
