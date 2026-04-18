import { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { SceneConfig } from '../types';
import { ParallaxScene } from './ParallaxScene';
import { applyEase } from '../utils/easing';

// ─── SceneEntry: one scene in the timeline ────────────────────────────────────

export interface SceneEntry {
  config: SceneConfig;
  startFrame: number;       // When this scene begins in the global timeline
  transitionIn?: number;    // Frames to fade in (0 = cut)
  transitionOut?: number;   // Frames to fade out (0 = cut)
}

interface SceneManagerProps {
  scenes: SceneEntry[];
}

// ─── SceneManager ─────────────────────────────────────────────────────────────
// Renders the correct scene(s) at the current frame.
// Handles cross-dissolve transitions between scenes.

export const SceneManager = ({ scenes }: SceneManagerProps) => {
  const frame = useCurrentFrame();

  // Find which scene(s) are active at the current frame
  const activeScenes = useMemo(() => {
    return scenes
      .map((entry, index) => {
        const nextEntry = scenes[index + 1];
        const sceneEnd = nextEntry?.startFrame ?? Infinity;
        const localFrame = frame - entry.startFrame;

        if (localFrame < 0 || frame >= sceneEnd + (entry.transitionOut ?? 0)) {
          return null;
        }

        // Compute opacity based on transition
        let opacity = 1;
        const fadeIn = entry.transitionIn ?? 0;
        const fadeOut = entry.transitionOut ?? 0;

        if (fadeIn > 0 && localFrame < fadeIn) {
          opacity = applyEase(localFrame / fadeIn, 'easeInOutCubic');
        } else if (fadeOut > 0 && nextEntry) {
          const framesUntilEnd = sceneEnd - frame;
          if (framesUntilEnd < fadeOut) {
            opacity = applyEase(framesUntilEnd / fadeOut, 'easeInOutCubic');
          }
        }

        return { entry, localFrame, opacity };
      })
      .filter(Boolean);
  }, [frame, scenes]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {activeScenes.map((active, i) => {
        if (!active) return null;
        const { entry, opacity } = active;
        return (
          <div
            key={entry.config.id + i}
            style={{
              position: 'absolute',
              inset: 0,
              opacity,
            }}
          >
            <ParallaxScene config={entry.config} />
          </div>
        );
      })}
    </div>
  );
};
