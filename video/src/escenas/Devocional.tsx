import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { Escena, useVertical } from '../partes/Escena';
import { Telefono, pantalla } from '../partes/Telefono';
import { VOZ } from '../voz';

/** El devocional real de la app: baja al pasaje, a la reflexión y a la pregunta cuando la voz los nombra. */
export function Devocional() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const vertical = useVertical();
  const ancho = vertical ? 660 : 470;
  const k = pantalla(ancho) / 390; // px por punto
  // Puntos de la captura (390 de ancho): pasaje arriba, reflexión ~620, pregunta ~1020.
  const y = interpolate(t, [0, 2.2, 2.9, 4.4, 4.9], [0, 0, 560, 560, 940], {
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  return (
    <Escena
      palabras={VOZ.devocional.palabras}
      destacar={['pasaje', 'reflexión', 'pregunta']}
      visual={
        <div>
          <Telefono ancho={ancho} zoom={interpolate(t, [4.6, 5.0], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.6)) })}>
            <Img src={staticFile('app/devocional.png')} style={{ width: '100%', transform: `translateY(${-y * k}px)` }} />
          </Telefono>
        </div>
      }
    />
  );
}
