// Pure helpers for fades. Kept free of native imports so they can be unit tested.

/** Equal-power fade-in gain for progress p in [0, 1]. */
export const fadeInGain = (p: number): number => Math.sin((Math.min(1, Math.max(0, p)) * Math.PI) / 2);

/** Equal-power fade-out gain for progress p in [0, 1]. */
export const fadeOutGain = (p: number): number => Math.cos((Math.min(1, Math.max(0, p)) * Math.PI) / 2);

/**
 * Gain at time t (ms) of a ramp from `from` to `to` over `durMs`, shaped with an
 * equal-power curve so two crossfading tracks keep a steady combined loudness.
 */
export const rampGain = (from: number, to: number, t: number, durMs: number): number => {
  if (durMs <= 0) return to;
  const p = Math.min(1, Math.max(0, t / durMs));
  if (to >= from) return from + (to - from) * fadeInGain(p);
  return to + (from - to) * fadeOutGain(p);
};

export const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

export const DEFAULT_VOLUME = 0.55;
export const FADE_IN_MS = 1500;
export const CROSSFADE_MS = 1800;
export const FADE_OUT_MS = 900;
