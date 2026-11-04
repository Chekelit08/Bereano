import { Composition } from 'remotion';
import { Presentacion } from './Presentacion';
import { FPS, TOTAL } from './voz';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Vertical: Reels, TikTok, historias y la app. */}
      <Composition id="Presentacion" component={Presentacion} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
      {/* Horizontal: la landing. */}
      <Composition id="PresentacionAncha" component={Presentacion} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
    </>
  );
};
