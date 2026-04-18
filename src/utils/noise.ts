import { ShakePreset, ShakePresetData } from '../types';

// ─── Noise Primitives ─────────────────────────────────────────────────────────

// Hash function for deterministic pseudo-random values
const hash = (n: number): number => {
  let x = Math.sin(n) * 43758.5453123;
  return x - Math.floor(x);
};

// Smooth 1D noise using cosine interpolation
export const smoothNoise = (x: number, seed: number = 0): number => {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f); // smoothstep
  const a = hash(i + seed * 127.1);
  const b = hash(i + 1 + seed * 127.1);
  return a * (1 - u) + b * u;
};

// Sine-based noise (smoother, for organic motion)
export const sineNoise = (x: number, seed: number = 0): number =>
  Math.sin(x * 1.3 + seed * 6.2831) * 0.5
  + Math.sin(x * 3.7 + seed * 1.7 + 1.1) * 0.3
  + Math.sin(x * 7.1 + seed * 2.9 + 2.3) * 0.2;

// Stepped noise (for glitch/digital effects)
export const steppedNoise = (x: number, seed: number = 0, steps: number = 8): number => {
  const stepped = Math.floor(x * steps) / steps;
  return hash(stepped * 31.41 + seed * 59.26) * 2 - 1;
};

// Multi-octave fractal Brownian motion noise
export const fbm = (
  x: number,
  seed: number = 0,
  octaves: number = 4,
  persistence: number = 0.5,
  lacunarity: number = 2.0,
): number => {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    value += smoothNoise(x * frequency + seed * (i + 1), seed) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  return (value / maxValue) * 2 - 1; // normalize to [-1, 1]
};

// ─── 16 Camera Shake Presets ──────────────────────────────────────────────────
// Each preset matches the Camera3D Toolkit Pro behavior from reverse-engineering

export const SHAKE_PRESETS: Record<ShakePreset, ShakePresetData> = {
  none: {
    name: 'None',
    frequency: 0, amplitude: 0, rotAmplitude: 0,
    octaves: 1, persistence: 0.5, lacunarity: 2,
    xWeight: 0, yWeight: 0, zWeight: 0,
    noiseType: 'smooth',
  },
  sinusoidal: {
    name: 'Sinusoidal',
    frequency: 4, amplitude: 0.04, rotAmplitude: 0.002,
    octaves: 1, persistence: 1.0, lacunarity: 1,
    xWeight: 1.0, yWeight: 0.6, zWeight: 0.2,
    noiseType: 'sine',
  },
  earthquake: {
    name: 'Earthquake',
    frequency: 18, amplitude: 0.35, rotAmplitude: 0.018,
    octaves: 5, persistence: 0.7, lacunarity: 2.2,
    xWeight: 1.0, yWeight: 0.9, zWeight: 0.5,
    noiseType: 'smooth',
  },
  handheld: {
    name: 'Handheld',
    frequency: 7, amplitude: 0.06, rotAmplitude: 0.004,
    octaves: 3, persistence: 0.6, lacunarity: 1.9,
    xWeight: 0.8, yWeight: 1.0, zWeight: 0.3,
    noiseType: 'smooth',
  },
  wind: {
    name: 'Wind',
    frequency: 2.5, amplitude: 0.05, rotAmplitude: 0.003,
    octaves: 4, persistence: 0.5, lacunarity: 2.1,
    xWeight: 1.0, yWeight: 0.3, zWeight: 0.15,
    noiseType: 'sine',
  },
  vehicle: {
    name: 'Vehicle',
    frequency: 22, amplitude: 0.08, rotAmplitude: 0.005,
    octaves: 2, persistence: 0.8, lacunarity: 3.0,
    xWeight: 0.5, yWeight: 1.0, zWeight: 0.2,
    noiseType: 'smooth',
  },
  explosion: {
    name: 'Explosion',
    frequency: 30, amplitude: 0.6, rotAmplitude: 0.035,
    octaves: 6, persistence: 0.8, lacunarity: 2.5,
    xWeight: 1.0, yWeight: 1.0, zWeight: 0.8,
    noiseType: 'smooth',
    irregularity: 0.3,
  },
  circular: {
    name: 'Circular',
    frequency: 5, amplitude: 0.08, rotAmplitude: 0.008,
    octaves: 1, persistence: 1.0, lacunarity: 1,
    xWeight: 1.0, yWeight: 1.0, zWeight: 0.6,
    noiseType: 'sine',
    // circular: x and y are 90° out of phase (see sampler below)
  },
  random: {
    name: 'Random',
    frequency: 12, amplitude: 0.1, rotAmplitude: 0.007,
    octaves: 4, persistence: 0.5, lacunarity: 2.3,
    xWeight: 1.0, yWeight: 1.0, zWeight: 0.4,
    noiseType: 'smooth',
    irregularity: 0.5,
  },
  oldFilm: {
    name: 'Old Film',
    frequency: 24, amplitude: 0.12, rotAmplitude: 0.006,
    octaves: 2, persistence: 0.9, lacunarity: 1.5,
    xWeight: 1.0, yWeight: 0.4, zWeight: 0.5,
    noiseType: 'stepped',
  },
  precise: {
    name: 'Precise',
    frequency: 3, amplitude: 0.01, rotAmplitude: 0.0005,
    octaves: 2, persistence: 0.4, lacunarity: 2.0,
    xWeight: 0.7, yWeight: 1.0, zWeight: 0.1,
    noiseType: 'sine',
  },
  drone: {
    name: 'Drone',
    frequency: 1.8, amplitude: 0.035, rotAmplitude: 0.002,
    octaves: 3, persistence: 0.45, lacunarity: 1.7,
    xWeight: 1.0, yWeight: 0.5, zWeight: 0.25,
    noiseType: 'sine',
  },
  motorcycle: {
    name: 'Motorcycle',
    frequency: 28, amplitude: 0.09, rotAmplitude: 0.006,
    octaves: 2, persistence: 0.85, lacunarity: 2.8,
    xWeight: 0.4, yWeight: 1.0, zWeight: 0.3,
    noiseType: 'smooth',
  },
  helicopter: {
    name: 'Helicopter',
    frequency: 14, amplitude: 0.07, rotAmplitude: 0.012,
    octaves: 2, persistence: 0.9, lacunarity: 2.0,
    xWeight: 0.8, yWeight: 0.7, zWeight: 1.0,
    noiseType: 'sine',
  },
  subway: {
    name: 'Subway',
    frequency: 16, amplitude: 0.14, rotAmplitude: 0.006,
    octaves: 3, persistence: 0.7, lacunarity: 2.1,
    xWeight: 1.0, yWeight: 0.6, zWeight: 0.2,
    noiseType: 'smooth',
  },
  heartbeat: {
    name: 'Heartbeat',
    frequency: 1.3, amplitude: 0.09, rotAmplitude: 0.003,
    octaves: 1, persistence: 1.0, lacunarity: 1,
    xWeight: 0.3, yWeight: 1.0, zWeight: 0.1,
    noiseType: 'sine',
    // Heartbeat: uses custom waveform (lub-dub pattern)
  },
  glitch: {
    name: 'Glitch',
    frequency: 24, amplitude: 0.22, rotAmplitude: 0.012,
    octaves: 1, persistence: 1.0, lacunarity: 1,
    xWeight: 1.0, yWeight: 0.6, zWeight: 0.8,
    noiseType: 'stepped',
    irregularity: 0.85,
  },
};

// ─── Shake Sample (converts preset data → XYZ delta at frame t) ──────────────

export interface ShakeSample {
  x: number;  // position offset
  y: number;
  roll: number; // rotation offset (radians)
}

// Heartbeat waveform: lub-dub pattern (double-pulse)
const heartbeatWave = (t: number): number => {
  const period = t % 1;
  if (period < 0.08) return Math.sin(period / 0.08 * Math.PI);        // lub rise
  if (period < 0.14) return Math.sin((period - 0.08) / 0.06 * Math.PI) * 0.5; // lub fall + dub rise
  if (period < 0.20) return Math.sin((period - 0.14) / 0.06 * Math.PI) * 0.7; // dub
  return 0;  // rest
};

export const sampleShake = (
  frame: number,
  totalFrames: number,
  preset: ShakePreset,
  amplitudeOverride: number = 0,
  frequencyOverride: number = 0,
  seed: number = 42,
  axes: { x: boolean; y: boolean; z: boolean } = { x: true, y: true, z: true },
): ShakeSample => {
  const p = SHAKE_PRESETS[preset];
  if (preset === 'none' || !p) return { x: 0, y: 0, roll: 0 };

  const amp = amplitudeOverride > 0 ? amplitudeOverride * 0.01 : p.amplitude;
  const freq = frequencyOverride > 0 ? frequencyOverride * 0.01 : p.frequency;
  const t = (frame / 30) * freq; // normalize to seconds at 30fps

  let x = 0, y = 0, roll = 0;

  switch (p.noiseType) {
    case 'sine': {
      x = sineNoise(t, seed) * amp * p.xWeight;
      y = sineNoise(t + 100, seed + 1) * amp * p.yWeight;
      roll = sineNoise(t + 200, seed + 2) * p.rotAmplitude * p.zWeight;
      break;
    }
    case 'stepped': {
      x = steppedNoise(t, seed) * amp * p.xWeight;
      y = steppedNoise(t, seed + 50) * amp * p.yWeight;
      roll = steppedNoise(t * 0.5, seed + 100) * p.rotAmplitude * p.zWeight;
      break;
    }
    case 'smooth':
    default: {
      x = fbm(t, seed, p.octaves, p.persistence, p.lacunarity) * amp * p.xWeight;
      y = fbm(t, seed + 31.7, p.octaves, p.persistence, p.lacunarity) * amp * p.yWeight;
      roll = fbm(t * 0.6, seed + 63.4, p.octaves, p.persistence, p.lacunarity) * p.rotAmplitude * p.zWeight;
      break;
    }
  }

  // Special overrides
  if (preset === 'circular') {
    // X and Y 90° phase offset → circular orbit
    x = Math.sin(t * 2 * Math.PI) * amp;
    y = Math.cos(t * 2 * Math.PI) * amp;
  }
  if (preset === 'heartbeat') {
    y = heartbeatWave(t * p.frequency * 0.1) * amp;
    x = y * 0.2;
  }
  if (p.irregularity && hash(frame * 17.3 + seed) < p.irregularity) {
    // Burst: random spike on irregular frames
    const burst = (hash(frame * 31.4 + seed) * 2 - 1) * amp * 2.5;
    x += burst * p.xWeight;
    y += burst * 0.5 * p.yWeight;
  }

  return {
    x: axes.x ? x : 0,
    y: axes.y ? y : 0,
    roll: axes.z ? roll : 0,
  };
};

// ─── Bake Shake to Keyframes ──────────────────────────────────────────────────
// Returns an array of {frame, x, y, roll} for all frames — useful for export

export interface ShakeKeyframe {
  frame: number;
  x: number;
  y: number;
  roll: number;
}

export const bakeShakeKeyframes = (
  totalFrames: number,
  preset: ShakePreset,
  amplitudeOverride: number = 0,
  frequencyOverride: number = 0,
  seed: number = 42,
): ShakeKeyframe[] => {
  return Array.from({ length: totalFrames }, (_, frame) => ({
    frame,
    ...sampleShake(frame, totalFrames, preset, amplitudeOverride, frequencyOverride, seed),
  }));
};
