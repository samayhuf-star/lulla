// Night arc: a bedtime routine that plays a chain of sound scenes by itself, each with its own
// length, crossfading between them, and fades out at the end. Pure logic, no native imports.
import type { MixItem } from './mixesLogic';

export interface Scene { name: string; items: MixItem[]; minutes: number }
export interface Arc { id: string; name: string; blurb: string; scenes: Scene[] }

export const SCENE_MINUTES = [10, 15, 20, 30, 45, 60] as const;
export const MAX_SCENES = 5;
/** Quiet dip between two scenes, each side (ms). */
export const DIP_MS = 4000;
/** The last scene fades out over this long before the arc ends (ms). */
export const END_FADE_MS = 60_000;

const it = (id: string, vol: number): MixItem => ({ id, vol });

// Presets use free sounds only, so they work for everyone.
export const PRESET_ARCS: Arc[] = [
  { id: 'settle', name: 'Settle in', blurb: 'Rain, then ocean, then steady brown noise. 60 min.', scenes: [
    { name: 'Rain', items: [it('rain', 0.8)], minutes: 10 },
    { name: 'Ocean', items: [it('ocean', 0.7), it('fan', 0.25)], minutes: 20 },
    { name: 'Deep', items: [it('brown_noise', 0.6), it('freq_432', 0.35)], minutes: 30 },
  ] },
  { id: 'forest', name: 'Forest night', blurb: 'Forest, then forest with 432 Hz, then fan. 45 min.', scenes: [
    { name: 'Forest', items: [it('forest', 0.8)], minutes: 15 },
    { name: 'Forest + tone', items: [it('forest', 0.55), it('freq_432', 0.45)], minutes: 15 },
    { name: 'Fan', items: [it('fan', 0.6), it('white_noise', 0.2)], minutes: 15 },
  ] },
  { id: 'nap', name: 'Power nap', blurb: 'Ocean, then white noise. 20 min.', scenes: [
    { name: 'Ocean', items: [it('ocean', 0.8)], minutes: 8 },
    { name: 'White noise', items: [it('white_noise', 0.5)], minutes: 12 },
  ] },
];

export const totalMinutes = (scenes: Scene[]) => scenes.reduce((s, x) => s + x.minutes, 0);

export interface ArcState {
  index: number;
  /** Master level 0..1: dips at scene changes, fades at the end, 1 otherwise. */
  gain: number;
  done: boolean;
  /** Time left in the whole arc (ms). */
  leftMs: number;
  /** True during the quiet dip right at a scene boundary, when the mix should be swapped. */
  swapNow: boolean;
}

export function arcAt(scenes: Scene[], elapsedMs: number): ArcState {
  const total = totalMinutes(scenes) * 60_000;
  const e = Math.max(0, elapsedMs);
  if (scenes.length === 0 || e >= total) return { index: Math.max(0, scenes.length - 1), gain: 0, done: true, leftMs: 0, swapNow: false };
  let start = 0;
  let index = 0;
  for (let i = 0; i < scenes.length; i += 1) {
    const len = scenes[i].minutes * 60_000;
    if (e < start + len) { index = i; break; }
    start += len;
  }
  const len = scenes[index].minutes * 60_000;
  const into = e - start;
  const last = index === scenes.length - 1;
  let gain = 1;
  let swapNow = false;
  // Dip down to silence over DIP_MS at the end of a scene (not the last) and back up at the start of the next.
  if (!last && len - into < DIP_MS) gain = (len - into) / DIP_MS;
  if (index > 0 && into < DIP_MS) { gain = into / DIP_MS; swapNow = into < 50; }
  if (last) {
    const fadeMs = Math.min(END_FADE_MS, len);
    if (len - into < fadeMs) gain = Math.min(gain, (len - into) / fadeMs);
  }
  return { index, gain: Math.min(1, Math.max(0, gain)), done: false, leftMs: total - e, swapNow };
}

export function addScene(scenes: Scene[], s: Scene): Scene[] {
  return scenes.length >= MAX_SCENES ? scenes : [...scenes, s];
}
export const removeScene = (scenes: Scene[], i: number) => scenes.filter((_, k) => k !== i);
/** Cycles a scene's length through SCENE_MINUTES. */
export function nextMinutes(m: number): number {
  const i = SCENE_MINUTES.indexOf(m as (typeof SCENE_MINUTES)[number]);
  return SCENE_MINUTES[(i + 1) % SCENE_MINUTES.length];
}
