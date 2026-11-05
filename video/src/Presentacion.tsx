import { Audio } from '@remotion/media';
import { AbsoluteFill, interpolate, Series, staticFile, useVideoConfig } from 'remotion';
import { Cierre } from './escenas/Cierre';
import { Companero } from './escenas/Companero';
import { Devocional } from './escenas/Devocional';
import { Gancho } from './escenas/Gancho';
import { Planes } from './escenas/Planes';
import { Promesa } from './escenas/Promesa';
import './tema';
import { frames, VOZ } from './voz';

/** Video de presentación de Bereano: 6 escenas, cada una dura lo que dura su voz. */
export function Presentacion() {
  const { durationInFrames, fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Audio
        src={staticFile('musica.mp3')}
        durationInFrames={durationInFrames}
        volume={(f) =>
          // Música movida debajo de la voz (−13 dB aprox.); entra y sale con fundido.
          0.22 * interpolate(f, [0, fps, durationInFrames - 2 * fps, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        }
      />
      <Series>
        <Series.Sequence name="Gancho" durationInFrames={frames('gancho')}>
          <Audio src={staticFile(VOZ.gancho.audio)} />
          <Gancho />
        </Series.Sequence>
        <Series.Sequence name="Promesa" durationInFrames={frames('promesa')}>
          <Audio src={staticFile(VOZ.promesa.audio)} />
          <Promesa />
        </Series.Sequence>
        <Series.Sequence name="Devocional" durationInFrames={frames('devocional')}>
          <Audio src={staticFile(VOZ.devocional.audio)} />
          <Devocional />
        </Series.Sequence>
        <Series.Sequence name="Compañero" durationInFrames={frames('companero')}>
          <Audio src={staticFile(VOZ.companero.audio)} />
          <Companero />
        </Series.Sequence>
        <Series.Sequence name="Planes" durationInFrames={frames('planes')}>
          <Audio src={staticFile(VOZ.planes.audio)} />
          <Planes />
        </Series.Sequence>
        <Series.Sequence name="Cierre" durationInFrames={frames('cierre')}>
          <Audio src={staticFile(VOZ.cierre.audio)} />
          <Cierre />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
}
