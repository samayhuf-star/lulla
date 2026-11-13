// Parses QA deep links used by the CI simulator run (only honoured when QA_MODE is on).
//   lulla://qa/play/snow          play one sound (direct, skips the gate, for audio checks)
//   lulla://qa/play/rain,snow     play a mix
//   lulla://qa/stop               stop everything
//   lulla://qa/paywall            stop and open the paywall (prices as StoreKit returns them)
//   lulla://qa/tap/snow           tap a sound tile, through the same gate as a finger tap
//   lulla://qa/close              press the paywall X (same handler as the button)
//   lulla://qa/settings           open the settings sheet (Restore purchases)
//   lulla://qa/preview/used       mark the premium preview as used up (memory only)
//   lulla://qa/preview/reset      give the premium preview back (memory only)
//   lulla://qa/timer/120          pick a sleep timer option (minutes, or allnight), logs end and fade start
//   lulla://qa/timersheet         open the sleep timer sheet
//   lulla://qa/cat/frequencies    pick a category chip by its first word (all = All)
//   lulla://qa/credits            open Settings > Sound credits
//   lulla://qa/hero               tap the Frequencies hero card (same handler as a finger tap)
//   lulla://qa/wrap/freq_432      play one sound and jump to 4 s before its loop point
export type QaCommand =
  | { kind: 'play'; ids: string[] }
  | { kind: 'tap'; id: string }
  | { kind: 'stop' }
  | { kind: 'paywall' }
  | { kind: 'close' }
  | { kind: 'settings' }
  | { kind: 'preview'; state: 'used' | 'reset' }
  | { kind: 'timer'; minutes: number | null }
  | { kind: 'timersheet' }
  | { kind: 'hero' }
  | { kind: 'credits' }
  | { kind: 'cat'; slug: string }
  | { kind: 'wrap'; id: string };

export function parseQaUrl(url: string | null | undefined): QaCommand | null {
  if (!url) return null;
  const m = /^lulla:\/\/qa\/(play|stop|paywall|tap|close|settings|preview|timer|timersheet|cat|wrap|hero|credits)(?:\/([a-z0-9_,]+))?\/?$/.exec(url.trim());
  if (!m) return null;
  const arg = m[2];
  switch (m[1]) {
    case 'stop':
    case 'paywall':
    case 'close':
    case 'settings':
    case 'timersheet':
    case 'hero':
    case 'credits':
      return arg ? null : { kind: m[1] };
    case 'timer':
      if (arg === 'allnight') return { kind: 'timer', minutes: null };
      return arg && /^\d{1,3}$/.test(arg) && +arg > 0 ? { kind: 'timer', minutes: +arg } : null;
    case 'cat':
      return arg && /^[a-z]+$/.test(arg) ? { kind: 'cat', slug: arg } : null;
    case 'wrap':
      return arg && !arg.includes(',') ? { kind: 'wrap', id: arg } : null;
    case 'tap':
      return arg && !arg.includes(',') ? { kind: 'tap', id: arg } : null;
    case 'preview':
      return arg === 'used' || arg === 'reset' ? { kind: 'preview', state: arg } : null;
    default: {
      const ids = (arg ?? '').split(',').filter(Boolean);
      return ids.length ? { kind: 'play', ids } : null;
    }
  }
}
