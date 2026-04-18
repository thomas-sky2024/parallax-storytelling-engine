import { DepthFadeConfig } from '../types';

// ─── Depth Fade ───────────────────────────────────────────────────────────────
// Calculates layer opacity based on its Z-depth relative to camera Z.
// Simulates atmospheric haze / depth-based opacity like Camera3D Toolkit's DepthFade.

export const computeDepthOpacity = (
  layerZ: number,
  cameraZ: number,
  config: DepthFadeConfig,
  baseOpacity: number = 1,
): number => {
  if (!config.enabled) return baseOpacity;

  // Distance from camera to layer (always positive)
  const distance = Math.abs(cameraZ - layerZ);
  const nearDist = Math.abs(cameraZ - config.nearZ);
  const farDist = Math.abs(cameraZ - config.farZ);

  if (distance <= nearDist) return baseOpacity;
  if (distance >= farDist) return baseOpacity * config.minOpacity;

  // Linear interpolation between nearDist and farDist
  const t = (distance - nearDist) / (farDist - nearDist);
  const fadedOpacity = 1 - t * (1 - config.minOpacity);

  return baseOpacity * fadedOpacity;
};

// ─── Auto-Focus Distance Computation ─────────────────────────────────────────
// Given a target layer's Z position and camera Z, compute the focus distance
// value for use in @react-three/postprocessing DepthOfField.
// focusDistance is normalized [0, 1] where 0 = camera, 1 = far clip.

export const computeAutoFocusDistance = (
  layerZ: number,
  cameraZ: number,
  nearClip: number = 0.1,
  farClip: number = 1000,
): number => {
  const worldDist = Math.abs(cameraZ - layerZ);
  // Normalize to [0, 1] using log scale for more intuitive control
  const normalized = Math.log(1 + worldDist) / Math.log(1 + farClip);
  return Math.max(0.001, Math.min(0.999, normalized));
};

// ─── Rack Focus Transition ────────────────────────────────────────────────────
// Interpolates focus distance between two target layers with easing.

export const rackFocusDistance = (
  fromZ: number,
  toZ: number,
  cameraZ: number,
  t: number, // progress [0, 1]
): number => {
  const fromDist = computeAutoFocusDistance(fromZ, cameraZ);
  const toDist = computeAutoFocusDistance(toZ, cameraZ);
  // Ease the rack focus using a cubic in/out
  const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  return fromDist + (toDist - fromDist) * eased;
};
