import { EaseType } from '../types';

// ─── Core Easing Functions ────────────────────────────────────────────────────
// All functions take t in [0, 1] and return a value in [0, 1]

export const linear = (t: number): number => t;

export const easeIn = (t: number): number => t * t;

export const easeOut = (t: number): number => t * (2 - t);

export const easeInOut = (t: number): number =>
  t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

export const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const easeOutExpo = (t: number): number =>
  t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

export const easeInExpo = (t: number): number =>
  t === 0 ? 0 : Math.pow(2, 10 * t - 10);

export const easeOutBounce = (t: number): number => {
  const n1 = 7.5625, d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
};

export const easeInBack = (t: number): number => {
  const c1 = 1.70158, c3 = c1 + 1;
  return c3 * t * t * t - c1 * t * t;
};

export const easeOutBack = (t: number): number => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export const easeInOutBack = (t: number): number => {
  const c1 = 1.70158, c2 = c1 * 1.525;
  return t < 0.5
    ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
    : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (2 * t - 2) + c2) + 2) / 2;
};

// Spring: physically-inspired oscillation that settles at 1
export const spring = (t: number, stiffness = 100, damping = 10): number => {
  // Simplified spring using damped oscillation
  const decay = Math.exp(-damping * t * 0.1);
  const oscillation = Math.sin(t * Math.sqrt(stiffness) * 0.1);
  return 1 - decay * Math.cos(t * Math.sqrt(stiffness) * 0.08) * (1 - t * 0.3);
};

// ─── Dispatcher ───────────────────────────────────────────────────────────────

export const applyEase = (t: number, type: EaseType): number => {
  const clamped = Math.max(0, Math.min(1, t));
  switch (type) {
    case 'linear':         return linear(clamped);
    case 'easeIn':         return easeIn(clamped);
    case 'easeOut':        return easeOut(clamped);
    case 'easeInOut':      return easeInOut(clamped);
    case 'easeInOutCubic': return easeInOutCubic(clamped);
    case 'easeOutExpo':    return easeOutExpo(clamped);
    case 'easeInExpo':     return easeInExpo(clamped);
    case 'easeOutBounce':  return easeOutBounce(clamped);
    case 'easeInBack':     return easeInBack(clamped);
    case 'easeOutBack':    return easeOutBack(clamped);
    case 'easeInOutBack':  return easeInOutBack(clamped);
    case 'spring':         return spring(clamped);
    default:               return linear(clamped);
  }
};

// ─── Speed Ramp ───────────────────────────────────────────────────────────────
// Returns a time-remapped progress value (0–1) → (0–1)
// based on min speed and easing

export const applySpeedRamp = (
  progress: number,
  minSpeed: number,
  easeType: EaseType,
  easeIn: boolean,
  easeOut: boolean,
): number => {
  if (!easeIn && !easeOut) return progress;

  // Build a speed curve: starts at 1.0, drops to minSpeed in middle, returns to 1.0
  // Then integrate to get position remapping
  const ease = applyEase(progress, easeType);

  if (easeIn && easeOut) {
    // Symmetric S-curve: fast → slow → fast
    const speedAtT = minSpeed + (1 - minSpeed) * (1 - Math.sin(Math.PI * progress));
    // Numerical integration approximation
    return progress * (minSpeed + (1 - minSpeed) * ease);
  }
  if (easeIn) {
    // Start slow, end fast
    return minSpeed * progress + (1 - minSpeed) * ease * progress;
  }
  // easeOut: start fast, end slow
  return progress * (1 - (1 - minSpeed) * ease * progress);
};

// ─── Interpolation Helper ─────────────────────────────────────────────────────

export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

export const interpolateEased = (
  progress: number,
  from: number,
  to: number,
  easeType: EaseType = 'easeInOutCubic',
): number => lerp(from, to, applyEase(progress, easeType));
