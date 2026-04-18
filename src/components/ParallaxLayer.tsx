import { useRef, useMemo } from 'react';
import { Image } from '@react-three/drei';
import { useCurrentFrame, staticFile } from 'remotion';
import { LayerConfig, DepthFadeConfig, CameraConfig } from '../types';
import { computeDepthOpacity } from '../utils/depthFade';
import { interpolateEased } from '../utils/easing';
import { ShakeConfig } from '../types';
import { sampleShake } from '../utils/noise';

interface ParallaxLayerProps {
  layer: LayerConfig;
  progress: number;           // Animation progress [0, 1]
  cameraConfig: CameraConfig;
  depthFadeConfig?: DepthFadeConfig;
  shakeConfig?: ShakeConfig;
  totalFrames?: number;
}

export const ParallaxLayer = ({
  layer,
  progress,
  cameraConfig,
  depthFadeConfig,
  shakeConfig,
  totalFrames = 450,
}: ParallaxLayerProps) => {
  const frame = useCurrentFrame();

  // ── Parallax X position ───────────────────────────────────────────────────
  // Camera travels from startX to endX.
  // Layer moves in opposite direction scaled by parallaxFactor.
  // parallaxFactor = 0  → layer is static (skybox)
  // parallaxFactor = 1  → layer moves at camera speed (no parallax, stuck to camera)
  // parallaxFactor > 1  → foreground over-travel (more dramatic parallax)

  const cameraX = interpolateEased(progress, cameraConfig.startX, cameraConfig.endX);
  const cameraY = interpolateEased(
    progress,
    cameraConfig.startY ?? 0,
    cameraConfig.endY ?? 0,
  );

  // Layer counteracts camera movement by parallaxFactor
  // A layer with factor=0.15 moves 15% as much as the camera → appears far away
  const layerX = (layer.xOffset ?? 0) + cameraX * (layer.parallaxFactor - 1);
  const layerY = (layer.yOffset ?? 0) + cameraY * (layer.parallaxFactor - 1);

  // ── Depth Fade opacity ────────────────────────────────────────────────────
  const opacity = useMemo(() => {
    if (!depthFadeConfig || !layer.depthFade) return layer.opacity ?? 1;
    return computeDepthOpacity(
      layer.z,
      cameraConfig.z,
      depthFadeConfig,
      layer.opacity ?? 1,
    );
  }, [layer.z, layer.depthFade, depthFadeConfig, cameraConfig.z, layer.opacity]);

  // ── Scale (could be animated in future) ──────────────────────────────────
  const scale = layer.scale;

  return (
    <Image
      url={staticFile(layer.url)}
      position={[layerX, layerY, layer.z]}
      scale={scale}
      transparent
      opacity={opacity}
    />
  );
};
