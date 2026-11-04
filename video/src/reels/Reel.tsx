import { Audio } from '@remotion/media';
import { AbsoluteFill, Img, interpolate, Series, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Escena, useVertical } from '../partes/Escena';
import { Fondo } from '../partes/Fondo';
import { Frase } from '../partes/Frase';
import { Telefono, pantalla } from '../partes/Telefono';
import { C, READ, UI } from '../tema';
import '../tema';
import type { Palabra } from '../voz';
import { REELS_LISTOS } from './generado';

type Escena = (typeof REELS_LISTOS)[number]['escenas'][number];
const FPS = 30;
const AIRE = 0.2;
export const framesEscena = (e: Escena, ultima: boolean) => Math.ceil((e.segundos + (ultima ? 1.6 : AIRE)) * FPS);
export const framesReel = (id: string) => {
  const r = REELS_LISTOS.find((x) => x.id === id)!;
  return r.escenas.reduce((a, e, i) => a + framesEscena(e, i === r.escenas.length - 1), 0);
};

/** Versículo: fondo azul, letra de lectura y la cita en una píldora. El texto es el de la RV1909. */
function Verso({ palabras, referencia }: { palabras: readonly Palabra[]; referencia: string }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const vertical = useVertical();
  const cita = spring({ frame: f - 6, fps, config: { damping: 12, stiffness: 150 } });
  const largo = palabras.reduce((a, p) => a + p.t.length + 1, 0);
  const size = Math.round(Math.max(58, Math.min(92, 92 - (largo - 60) * 0.25)));
  return (
    <AbsoluteFill>
      <Fondo oscuro />
      <AbsoluteFill style={{ padding: vertical ? '0 90px 260px' : '0 200px', justifyContent: 'center', gap: 50 }}>
        <span style={{ fontFamily: READ, fontSize: 220, lineHeight: 0.6, color: '#FFD43B', height: 90, opacity: cita }}>“</span>
        <Frase palabras={[...palabras]} size={size} color="#fff" fuente={READ} peso={500} pildora="#FFD43B" pildoraTexto={C.text} />
        <span
          style={{
            alignSelf: 'flex-start',
            fontFamily: UI,
            fontWeight: 800,
            fontSize: 44,
            color: C.text,
            background: '#fff',
            padding: '16px 34px',
            borderRadius: 999,
            transform: `scale(${cita}) rotate(-2deg)`,
            transformOrigin: 'left center',
          }}>
          {referencia} · RV1909
        </span>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

/** El compañero responde: la respuesta se escribe al ritmo de la voz y al final aparecen las citas ✓. */
function Chat({ pregunta, palabras, dur }: { pregunta: string; palabras: readonly Palabra[]; dur: number }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const vertical = useVertical();
  const ancho = vertical ? 660 : 470;
  const k = pantalla(ancho) / 390;
  const visibles = palabras.filter((p) => p.s <= t).map((p) => p.t).join(' ');
  const burbuja = { fontFamily: UI, fontSize: 17 * k, lineHeight: 1.4, padding: `${12 * k}px ${15 * k}px`, borderRadius: 20 * k };
  const citas = ['Mateo 5:5', 'Salmos 37:11', 'Mateo 11:29'];
  return (
    <Escena
      palabras={[...palabras]}
      visual={
        <Telefono ancho={ancho} zoom={interpolate(t, [dur - 1.4, dur - 0.9], [0, 0.6], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
          <div style={{ position: 'absolute', inset: 0, background: '#fff', padding: `${62 * k}px ${16 * k}px`, display: 'flex', flexDirection: 'column', gap: 12 * k }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 * k, paddingBottom: 12 * k, borderBottom: '1px solid #0000001a' }}>
              <Img src={staticFile('logo.svg')} style={{ width: 34 * k, height: 34 * k }} />
              <div style={{ fontFamily: UI }}>
                <div style={{ fontWeight: 700, fontSize: 17 * k, color: C.text }}>Compañero</div>
                <div style={{ fontSize: 13 * k, color: C.muted }}>Leyendo Mateo 5</div>
              </div>
            </div>
            <div style={{ ...burbuja, alignSelf: 'flex-end', maxWidth: '82%', background: C.blue, color: '#fff' }}>{pregunta}</div>
            <div style={{ ...burbuja, alignSelf: 'flex-start', maxWidth: '88%', background: C.surface, color: C.text, minHeight: 20 * k }}>
              {visibles || '•••'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 * k }}>
              {citas.map((c, i) => {
                const s = spring({ frame: f - (dur - 1.5 + i * 0.2) * fps, fps, config: { damping: 12, stiffness: 160 } });
                return (
                  <span key={c} style={{ fontFamily: UI, fontWeight: 700, fontSize: 14 * k, color: '#0A7A34', background: '#E6F6EC', borderRadius: 999, padding: `${6 * k}px ${11 * k}px`, transform: `scale(${s})` }}>
                    ✓ {c}
                  </span>
                );
              })}
            </div>
          </div>
        </Telefono>
      }
    />
  );
}

/** Un paso de la oración guiada: la lista de 4 pasos con el actual resaltado y su versículo. */
function Paso({ e }: { e: Extract<Escena, { tipo: 'paso' }> }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Escena
      palabras={[...e.palabras]}
      destacar={e.destacar ? [...e.destacar] : undefined}
      visual={
        <div style={{ marginTop: 120, display: 'flex', flexDirection: 'column', gap: 22, width: 760 }}>
          {e.pasos.map((p, i) => {
            const actual = i === e.paso;
            const hecho = i < e.paso;
            const s = actual ? spring({ frame: f - 4, fps, config: { damping: 11, stiffness: 160 } }) : 1;
            return (
              <div
                key={p}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 28,
                  padding: '26px 34px',
                  borderRadius: 32,
                  background: actual ? C.blue : '#ffffffcc',
                  color: actual ? '#fff' : hecho ? C.muted : C.text,
                  boxShadow: actual ? `0 24px 50px ${C.blue}55` : '0 6px 20px #0000000d',
                  transform: `scale(${actual ? 0.9 + s * 0.12 : 1})`,
                  fontFamily: UI,
                }}>
                <span style={{ width: 70, height: 70, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: actual ? '#ffffff33' : C.surface, fontWeight: 900, fontSize: 36 }}>
                  {hecho ? '✓' : i + 1}
                </span>
                <span style={{ fontWeight: 900, fontSize: 52, letterSpacing: '-0.03em', flex: 1 }}>{p}</span>
                {actual && <span style={{ fontWeight: 700, fontSize: 28, opacity: 0.9 }}>{e.referencia}</span>}
              </div>
            );
          })}
        </div>
      }
    />
  );
}

/** Cierre: fondo azul, logo y botón que late. */
function Cierre({ e }: { e: Extract<Escena, { tipo: 'cierre' }> }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fin = e.palabras[e.palabras.length - 1]?.e ?? 2;
  const logo = spring({ frame: f - Math.max(0.3, fin - 1.4) * fps, fps, config: { damping: 9, stiffness: 140 } });
  const cta = spring({ frame: f - (fin - 0.6) * fps, fps, config: { damping: 10, stiffness: 160 } });
  const late = 1 + Math.pow(1 - ((f / fps) * 2) % 1, 3) * 0.05 * cta;
  return (
    <Escena
      oscuro
      palabras={[...e.palabras]}
      destacar={e.destacar ? [...e.destacar] : undefined}
      visual={
        <div style={{ marginTop: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28, transform: `scale(${logo})` }}>
            <Img src={staticFile('logo.svg')} style={{ width: 150, height: 150, borderRadius: 34, boxShadow: '0 0 0 5px #ffffff55' }} />
            <span style={{ fontFamily: UI, fontWeight: 900, fontSize: 104, letterSpacing: '-0.045em', color: '#fff' }}>Bereano</span>
          </div>
          <div style={{ fontFamily: UI, fontWeight: 900, fontSize: 48, color: C.blue, background: '#fff', padding: '26px 54px', borderRadius: 999, transform: `scale(${cta * late})`, boxShadow: '0 20px 50px #00000040' }}>
            {e.boton} ↗
          </div>
        </div>
      }
    />
  );
}

function Pantalla({ e }: { e: Extract<Escena, { tipo: 'pantalla' }> }) {
  const vertical = useVertical();
  return (
    <Escena
      palabras={[...e.palabras]}
      destacar={e.destacar ? [...e.destacar] : undefined}
      visual={
        <Telefono ancho={vertical ? 660 : 470}>
          <Img src={staticFile(e.captura)} style={{ width: '100%' }} />
        </Telefono>
      }
    />
  );
}

function Una({ e }: { e: Escena }) {
  switch (e.tipo) {
    case 'frase':
      return <Escena palabras={[...e.palabras]} destacar={e.destacar ? [...e.destacar] : undefined} />;
    case 'verso':
      return <Verso palabras={e.palabras} referencia={e.referencia} />;
    case 'chat':
      return <Chat pregunta={e.pregunta} palabras={e.palabras} dur={e.segundos} />;
    case 'pantalla':
      return <Pantalla e={e} />;
    case 'paso':
      return <Paso e={e} />;
    case 'cierre':
      return <Cierre e={e} />;
  }
}

/** Un reel completo: escenas en serie, cada una con su toma de voz, y su propio tema de fondo. */
export function Reel({ id }: { id: string }) {
  const r = REELS_LISTOS.find((x) => x.id === id)!;
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Audio
        src={staticFile(r.musica)}
        volume={(f) => 0.2 * interpolate(f, [0, 10, durationInFrames - 30, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
      />
      <Series>
        {r.escenas.map((e, i) => (
          <Series.Sequence key={i} name={`${i + 1}. ${e.tipo}`} durationInFrames={framesEscena(e, i === r.escenas.length - 1)}>
            <Audio src={staticFile(e.audio)} />
            <Una e={e} />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
}
