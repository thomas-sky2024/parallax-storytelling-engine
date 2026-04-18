import { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, DepthOfField, Bloom, Vignette } from '@react-three/postprocessing';
import { KernelSize } from 'postprocessing';
import { ParallaxLayer } from './ParallaxLayer';
import { CameraController } from './CameraController';
import { SceneConfig, LayerConfig } from '../types';
import { applySpeedRamp } from '../utils/easing';
import { computeAutoFocusDistance, rackFocusDistance } from '../utils/depthFade';

interface ParallaxSceneProps {
  config: SceneConfig;
}

// ─── Inner 3D Scene (runs inside Canvas) ─────────────────────────────────────

const Scene3D = ({ config }: { config: SceneConfig }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const rawProgress = frame / durationInFrames;

  const progress = config.speedRamp?.enabled
    ? applySpeedRamp(
        rawProgress,
        config.speedRamp.minSpeed,
        config.speedRamp.easeType,
        config.speedRamp.easeIn,
        config.speedRamp.easeOut,
      )
    : rawProgress;

  // Auto-focus: find the target layer's Z position
  const focusTargetLayer = config.dof?.autoFocus?.enabled
    ? config.layers.find((l) => l.id === config.dof?.autoFocus?.layerId)
    : null;

  const focusDistance = useMemo(() => {
    if (!config.dof?.enabled) return 0.025;

    // 1. Check for Rack Focus (animated transition between layers)
    if (config.dof.rackFocus?.enabled) {
      const { fromLayerId, toLayerId, startProgress, endProgress } = config.dof.rackFocus;
      const fromLayer = config.layers.find((l) => l.id === fromLayerId);
      const toLayer = config.layers.find((l) => l.id === toLayerId);

      if (fromLayer && toLayer) {
        if (progress < startProgress) {
          return computeAutoFocusDistance(fromLayer.z, config.camera.z);
        }
        if (progress > endProgress) {
          return computeAutoFocusDistance(toLayer.z, config.camera.z);
        }
        // Normalize progress within the rack focus window
        const t = (progress - startProgress) / (endProgress - startProgress);
        return rackFocusDistance(fromLayer.z, toLayer.z, config.camera.z, t);
      }
    }

    // 2. Fallback to AutoFocus or static distance
    if (focusTargetLayer) {
      return computeAutoFocusDistance(focusTargetLayer.z, config.camera.z);
    }
    return config.dof.focusDistance;
  }, [config.dof, focusTargetLayer, config.camera.z, progress]);

  // Sort layers back-to-front for correct transparency rendering
  const sortedLayers = useMemo(
    () => [...config.layers].sort((a, b) => a.z - b.z),
    [config.layers],
  );

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 20, 10]} intensity={1.0} />

      {/* Camera */}
      <CameraController
        cameraConfig={config.camera}
        shakeConfig={config.shake}
        dofConfig={config.dof}
        speedRampConfig={config.speedRamp}
        focusTargetZ={focusTargetLayer?.z}
      />

      {/* Parallax Layers — rendered back to front */}
      {sortedLayers.map((layer: LayerConfig) => (
        <ParallaxLayer
          key={layer.id}
          layer={layer}
          progress={progress}
          cameraConfig={config.camera}
          depthFadeConfig={config.depthFade}
          shakeConfig={config.shake}
          totalFrames={durationInFrames}
        />
      ))}

      {/* Post-processing */}
      {config.dof?.enabled && (
        <EffectComposer>
          <DepthOfField
            focusDistance={focusDistance}
            focalLength={config.dof.focalLength}
            bokehScale={config.dof.bokehScale}
          />
          <Bloom
            luminanceThreshold={0.85}
            luminanceSmoothing={0.8}
            height={400}
            kernelSize={KernelSize.MEDIUM}
          />
          <Vignette eskil={false} offset={0.3} darkness={0.5} />
        </EffectComposer>
      )}
    </>
  );
};

// ─── Main Export: Remotion Composition Component ──────────────────────────────

export const ParallaxScene = ({ config }: ParallaxSceneProps) => {
  const { width, height } = useVideoConfig();

  return (
    <div style={{ width, height, backgroundColor: '#000' }}>
      <Canvas
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: false }}
        camera={{
          fov: config.camera.fov,
          near: 0.1,
          far: 1000,
          position: [config.camera.startX, 0, config.camera.z],
        }}
      >
        <Scene3D config={config} />
      </Canvas>
    </div>
  );
};
