import { Composition, registerRoot } from 'remotion';
import { SceneManager, SceneEntry } from './components/SceneManager';
import { SceneConfig } from './types';

// Import scene configs
import scene1 from './config/scenes/scene1.json';
import scene2 from './config/scenes/scene2.json';

const scenes: SceneEntry[] = [
  {
    config: scene1 as unknown as SceneConfig,
    startFrame: 0,
    transitionOut: 45, // 1.5s cross-dissolve
  },
  {
    config: scene2 as unknown as SceneConfig,
    startFrame: 255, // transition starts at frame 255 (300 - 45)
    transitionIn: 45,
  },
];

// Calculate total duration
const totalDuration = scenes[scenes.length - 1].startFrame + (scenes[scenes.length - 1].config.durationInFrames);

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="ParallaxStory"
        component={SceneManager}
        durationInFrames={totalDuration}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ scenes }}
      />
    </>
  );
};

// Registration is now handled in index.tsx
