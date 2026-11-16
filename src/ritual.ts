// Wind-down ritual: a guided breathing pacer that runs with the sound mix and hands off to the
// sleep timer. Pure logic, no native imports, so it can be unit tested.

export type PhaseName = 'in' | 'hold' | 'out' | 'rest';

export interface Pattern {
  id: 'calm' | 'relax478' | 'box';
  name: string;
  blurb: string;
  /** Seconds for each phase, in order. 0 means the phase is skipped. */
  inSec: number;
  holdSec: number;
  outSec: number;
  restSec: number;
}

export const PATTERNS: Pattern[] = [
  { id: 'calm', name: 'Slow 4 · 6', blurb: 'Breathe in for 4, out for 6.', inSec: 4, holdSec: 0, outSec: 6, restSec: 0 },
  { id: 'relax478', name: '4 · 7 · 8', blurb: 'In for 4, hold for 7, out for 8.', inSec: 4, holdSec: 7, outSec: 8, restSec: 0 },
  { id: 'box', name: 'Box 4 · 4 · 4 · 4', blurb: 'In, hold, out, rest, 4 seconds each.', inSec: 4, holdSec: 4, outSec: 4, restSec: 4 },
];

export const RITUAL_MINUTES = [3, 5, 10] as const;
export type RitualMinutes = (typeof RITUAL_MINUTES)[number];

/** Sleep timer started when the ritual ends (minutes). */
export const HANDOFF_TIMER_MINUTES = [30, 60, 120] as const;

export const patternById = (id: string): Pattern => PATTERNS.find((p) => p.id === id) ?? PATTERNS[0];

export const cycleSeconds = (p: Pattern) => p.inSec + p.holdSec + p.outSec + p.restSec;

export interface PhaseState {
  phase: PhaseName;
  /** Whole seconds left in this phase, counting down (never below 1 while the phase runs). */
  secondsLeft: number;
  /** 0 = lungs empty, 1 = lungs full. Drives circle size and the gentle volume swell. */
  fullness: number;
  /** Completed full breaths so far. */
  breaths: number;
}

export const PHASE_LABEL: Record<PhaseName, string> = {
  in: 'Breathe in',
  hold: 'Hold',
  out: 'Breathe out',
  rest: 'Rest',
};

/** Where the pacer is at `elapsedMs` since the ritual started. */
export function phaseAt(p: Pattern, elapsedMs: number): PhaseState {
  const cycle = cycleSeconds(p) * 1000;
  const e = Math.max(0, elapsedMs);
  const breaths = Math.floor(e / cycle);
  const t = (e % cycle) / 1000;
  const segs: [PhaseName, number][] = [
    ['in', p.inSec], ['hold', p.holdSec], ['out', p.outSec], ['rest', p.restSec],
  ];
  let start = 0;
  for (const [phase, len] of segs) {
    if (len <= 0) continue;
    if (t < start + len) {
      const into = t - start;
      const frac = into / len;
      const fullness = phase === 'in' ? frac : phase === 'hold' ? 1 : phase === 'out' ? 1 - frac : 0;
      return { phase, secondsLeft: Math.max(1, Math.ceil(len - into)), fullness, breaths };
    }
    start += len;
  }
  return { phase: 'rest', secondsLeft: 1, fullness: 0, breaths };
}

/** Master level during the ritual: the mix swells a little on the inhale and ebbs on the exhale. */
export const SWELL_MIN = 0.7;
export function ritualGain(fullness: number): number {
  const f = Math.min(1, Math.max(0, fullness));
  return SWELL_MIN + (1 - SWELL_MIN) * f;
}

export const ritualDone = (elapsedMs: number, minutes: number) => elapsedMs >= minutes * 60_000;

/** Free sound the ritual starts when the mix is empty. */
export const DEFAULT_RITUAL_SOUND = 'rain';
