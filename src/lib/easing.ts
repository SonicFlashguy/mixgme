/**
 * Easing Functions for Ultra-Smooth Animation
 * Mathematical curves for natural movement transitions
 */

export type EasingFunction = (t: number) => number;

/**
 * Linear interpolation (no easing)
 */
export const linear: EasingFunction = (t: number) => t;

/**
 * Cubic easing functions (smooth acceleration/deceleration)
 */
export const easeInCubic: EasingFunction = (t: number) => t * t * t;
export const easeOutCubic: EasingFunction = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOutCubic: EasingFunction = (t: number) => 
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Quartic easing functions (stronger curves)
 */
export const easeInQuart: EasingFunction = (t: number) => t * t * t * t;
export const easeOutQuart: EasingFunction = (t: number) => 1 - Math.pow(1 - t, 4);
export const easeInOutQuart: EasingFunction = (t: number) =>
  t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

/**
 * Exponential easing (very smooth for large movements)
 */
export const easeInExpo: EasingFunction = (t: number) => 
  t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
export const easeOutExpo: EasingFunction = (t: number) => 
  t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
export const easeInOutExpo: EasingFunction = (t: number) => {
  if (t === 0) return 0;
  if (t === 1) return 1;
  if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
  return (2 - Math.pow(2, -20 * t + 10)) / 2;
};

/**
 * Circular easing (smooth curves)
 */
export const easeInCirc: EasingFunction = (t: number) => 
  1 - Math.sqrt(1 - Math.pow(t, 2));
export const easeOutCirc: EasingFunction = (t: number) => 
  Math.sqrt(1 - Math.pow(t - 1, 2));
export const easeInOutCirc: EasingFunction = (t: number) =>
  t < 0.5
    ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
    : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2;

/**
 * Elastic easing (subtle bounce effect)
 */
export const easeOutElastic: EasingFunction = (t: number) => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0
    ? 0
    : t === 1
    ? 1
    : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

/**
 * Smart easing selector based on movement characteristics
 */
export const selectEasing = (distance: number, speed: number): EasingFunction => {
  // For very small movements, use linear
  if (distance < 0.1) return linear;
  
  // For medium movements, use cubic out for smoothness
  if (distance < 1.0) return easeOutCubic;
  
  // For large movements, use exponential out for natural deceleration
  if (distance < 5.0) return easeOutExpo;
  
  // For very large movements, use circular out with slight elastic
  return easeOutCirc;
};

/**
 * Interpolate between two values using an easing function
 */
export const interpolate = (
  from: number,
  to: number,
  progress: number,
  easingFn: EasingFunction = easeOutCubic
): number => {
  const t = Math.max(0, Math.min(1, progress));
  const easedT = easingFn(t);
  return from + (to - from) * easedT;
};

/**
 * Subpixel interpolation for ultra-smooth movement
 */
export const subpixelInterpolate = (
  from: number,
  to: number,
  progress: number,
  easingFn: EasingFunction = easeOutCubic
): number => {
  // Use higher precision for subpixel rendering
  const t = Math.max(0, Math.min(1, progress));
  const easedT = easingFn(t);
  const result = from + (to - from) * easedT;
  
  // Return with high precision (no rounding for subpixel accuracy)
  return result;
};
