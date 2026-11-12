// Parses QA deep links used by the CI simulator run (only honoured when QA_MODE is on).
//   lulla://qa/play/snow          play one sound
//   lulla://qa/play/rain,snow     play a mix
//   lulla://qa/stop               stop everything
//   lulla://qa/paywall            stop and open the paywall (prices as StoreKit returns them)
export type QaCommand = { kind: 'play'; ids: string[] } | { kind: 'stop' } | { kind: 'paywall' };

export function parseQaUrl(url: string | null | undefined): QaCommand | null {
  if (!url) return null;
  const m = /^lulla:\/\/qa\/(play|stop|paywall)(?:\/([a-z0-9_,]+))?\/?$/.exec(url.trim());
  if (!m) return null;
  if (m[1] === 'stop') return { kind: 'stop' };
  if (m[1] === 'paywall') return m[2] ? null : { kind: 'paywall' };
  const ids = (m[2] ?? '').split(',').filter(Boolean);
  return ids.length ? { kind: 'play', ids } : null;
}
