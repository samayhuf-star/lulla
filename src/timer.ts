// Sleep timer maths. Pure, no native imports, so it can be unit tested.

/** The sleep timer fades the whole mix out over the last minute before it stops. */
export const SLEEP_FADE_SEC = 60;

/** minutes: a number of minutes, or null for All night (no auto-stop, loops until you stop). */
export type TimerMinutes = number | null;

export interface TimerPlan {
  startMs: number;
  endMs: number;
  fadeStartMs: number;
}

/** null means nothing is scheduled: playback never stops on its own. */
export function planTimer(startMs: number, minutes: TimerMinutes): TimerPlan | null {
  if (minutes == null || !(minutes > 0)) return null;
  const endMs = startMs + minutes * 60_000;
  return { startMs, endMs, fadeStartMs: endMs - SLEEP_FADE_SEC * 1000 };
}

/** Master level at nowMs: 1 until the fade starts, then down to 0 at the end. */
export function timerGain(nowMs: number, plan: TimerPlan | null): number {
  if (!plan || nowMs <= plan.fadeStartMs) return 1;
  if (nowMs >= plan.endMs) return 0;
  return (plan.endMs - nowMs) / (plan.endMs - plan.fadeStartMs);
}

export const timerDone = (nowMs: number, plan: TimerPlan | null) => !!plan && nowMs >= plan.endMs;
