import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { CameraConfig, ShakeConfig, DOFConfig, SpeedRampConfig } from '../types';
import { interpolateEased } from '../utils/easing';
import { applySpeedRamp } from '../utils/easing';
import { sampleShake } from '../utils/noise';
import { computeAutoFocusDistance } from '../utils/depthFade';

interface CameraControllerProps {
  cameraConfig: CameraConfig;
  shakeConfig?: ShakeConfig;
  dofConfig?: DOFConfig;
  speedRampConfig?: SpeedRampConfig;
  // For AutoFocus: Z position of the target layer
  focusTargetZ?: number;
}

export const CameraController = ({
  cameraConfig,
  shakeConfig,
  dofConfig,
  speedRampConfig,
  focusTargetZ,
}: CameraControllerProps) => {
  const { camera } = useThree();
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  // Raw progress [0, 1]
  const rawProgress = frame / durationInFrames;

  // Apply speed ramp to get remapped progress
  const progress = speedRampConfig?.enabled
    ? applySpeedRamp(
        rawProgress,
        speedRampConfig.minSpeed,
        speedRampConfig.easeType,
        speedRampConfig.easeIn,
        speedRampConfig.easeOut,
      )
    : rawProgress;

  useFrame(() => {
    // ── Base camera position ─────────────────────────────────────────────────
    const baseX = interpolateEased(
      progress,
      cameraConfig.startX,
      cameraConfig.endX,
      'easeInOutCubic',
    );
    const baseY = interpolateEased(
      progress,
      cameraConfig.startY ?? 0,
      cameraConfig.endY ?? 0,
      'easeInOutCubic',
    );

    // ── Shake offset ─────────────────────────────────────────────────────────
    let shakeX = 0, shakeY = 0, shakeRoll = 0;
    if (shakeConfig && shakeConfig.preset !== 'none') {
      const sample = sampleShake(
        frame,
        durationInFrames,
        shakeConfig.preset,
        shakeConfig.amplitude,
        shakeConfig.frequency,
        shakeConfig.seed ?? 42,
        shakeConfig.axes,
      );
      shakeX = sample.x;
      shakeY = sample.y;
      shakeRoll = sample.roll;
    }

    // ── Apply to camera ──────────────────────────────────────────────────────
    camera.position.set(
      baseX + shakeX,
      baseY + shakeY,
      cameraConfig.z,
    );

    // Roll (Z-rotation)
    camera.rotation.z = shakeRoll;

    // Look at target (synchronized with X to create a tracking shot)
    camera.lookAt(baseX, cameraConfig.lookAtY ?? 0, 0);

    // FOV
    if ('fov' in camera) {
      (camera as any).fov = cameraConfig.fov;
      camera.updateProjectionMatrix();
    }
  });

  return null; // No visual output — camera mutations only
};
