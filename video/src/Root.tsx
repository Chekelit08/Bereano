import { Composition, Folder } from 'remotion';
import { framesReel, Reel } from './reels/Reel';
import { REELS_LISTOS } from './reels/generado';
import { Presentacion } from './Presentacion';
import { FPS, TOTAL } from './voz';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Vertical: Reels, TikTok, historias y la app. */}
      <Composition id="Presentacion" component={Presentacion} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
      {/* Horizontal: la landing. */}
      <Composition id="PresentacionAncha" component={Presentacion} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
      <Folder name="Reels">
        {REELS_LISTOS.map((r) => (
          <Composition key={r.id} id={`Reel-${r.id}`} component={Reel} defaultProps={{ id: r.id }} durationInFrames={framesReel(r.id)} fps={FPS} width={1080} height={1920} />
        ))}
      </Folder>
    </>
  );
};
