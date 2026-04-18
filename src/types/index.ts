// ─── Layer & Scene ────────────────────────────────────────────────────────────

export interface LayerConfig {
  id: string;
  url: string;
  z: number;             // Z-depth in 3D space (negative = further back)
  scale: number;         // World-space scale
  parallaxFactor: number; // 0 = static, 1 = camera-speed, 2 = over-travel
  xOffset?: number;
  yOffset?: number;
  opacity?: number;      // Base opacity (0–1), Depth Fade will modulate this
  depthFade?: boolean;   // Whether this layer fades with distance
}

export interface CameraConfig {
  startX: number;
  endX: number;
  startY?: number;
  endY?: number;
  z: number;
  fov: number;
  lookAtY?: number;
}

export interface ShakeConfig {
  preset: ShakePreset;
  amplitude: number;     // Override preset amplitude (0 = use preset default)
  frequency: number;     // Override preset frequency (0 = use preset default)
  seed?: number;
  axes: {
    x: boolean;
    y: boolean;
    z: boolean;          // Roll
  };
}

export interface DOFConfig {
  enabled: boolean;
  focusDistance: number; // 0–1 (normalized)
  focalLength: number;
  bokehScale: number;
  autoFocus?: {
    enabled: boolean;
    layerId: string;     // Which layer to auto-focus on
  };
  rackFocus?: {
    enabled: boolean;
    fromLayerId: string;
    toLayerId: string;
    startProgress: number; // 0–1
    endProgress: number;   // 0–1
  };
}

export interface SpeedRampConfig {
  enabled: boolean;
  minSpeed: number;      // Minimum speed as fraction (0.1 = 10%)
  easeIn: boolean;
  easeOut: boolean;
  easeType: EaseType;
}

export interface DepthFadeConfig {
  enabled: boolean;
  nearZ: number;         // Z closer than this = full opacity
  farZ: number;          // Z further than this = minimum opacity
  minOpacity: number;    // 0–1
}

export interface SceneConfig {
  id: string;
  title?: string;
  durationInFrames: number;
  fps: number;
  width?: number;
  height?: number;
  camera: CameraConfig;
  shake?: ShakeConfig;
  dof?: DOFConfig;
  speedRamp?: SpeedRampConfig;
  depthFade?: DepthFadeConfig;
  layers: LayerConfig[];
}

// ─── Enums ────────────────────────────────────────────────────────────────────

export type EaseType =
  | 'linear'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'easeInOutCubic'
  | 'easeOutExpo'
  | 'easeInExpo'
  | 'easeOutBounce'
  | 'easeInBack'
  | 'easeOutBack'
  | 'easeInOutBack'
  | 'spring';

export type ShakePreset =
  | 'none'
  | 'sinusoidal'
  | 'earthquake'
  | 'handheld'
  | 'wind'
  | 'vehicle'
  | 'explosion'
  | 'circular'
  | 'random'
  | 'oldFilm'
  | 'precise'
  | 'drone'
  | 'motorcycle'
  | 'helicopter'
  | 'subway'
  | 'heartbeat'
  | 'glitch';

// ─── Camera Shake Preset Data ─────────────────────────────────────────────────

export interface ShakePresetData {
  name: string;
  frequency: number;       // Primary frequency (Hz equivalent at 30fps)
  amplitude: number;       // Position amplitude in world units
  rotAmplitude: number;    // Rotation amplitude in radians
  octaves: number;         // Number of noise layers
  persistence: number;     // Amplitude falloff per octave (0–1)
  lacunarity: number;      // Frequency multiplier per octave
  xWeight: number;         // X-axis weight (0–1)
  yWeight: number;         // Y-axis weight (0–1)
  zWeight: number;         // Z-rotation weight (0–1)
  noiseType: 'smooth' | 'stepped' | 'sine' | 'irregular';
  irregularity?: number;   // For 'irregular' type: burst chance per frame (0–1)
}
