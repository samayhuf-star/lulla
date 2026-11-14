// Frequencies hero card: pure settings, no native imports, so they can be unit tested.
import type { Category } from './catalog';

export const HERO_CATEGORY: Category = 'Frequencies';
export const HERO_TITLE = 'Frequencies';
export const HERO_SUB = '432, 528 and 963 Hz tones over warm pads. 432 Hz Deep Sleep is free.';

export interface HeroMotion {
  /** true runs the slow breathing glow; false shows a still glow. */
  breathe: boolean;
  /** Glow opacity range; with Reduce Motion the glow holds still at `rest`. */
  min: number;
  max: number;
  rest: number;
  /** One full breath (in and out), in ms. */
  periodMs: number;
}

export function heroMotion(reduceMotion: boolean): HeroMotion {
  return { breathe: !reduceMotion, min: 0.35, max: 0.8, rest: 0.55, periodMs: 8000 };
}
