// Sleep journal: a 10-second morning check-in kept on the device. Pure logic.
// Not a medical tool: it only shows the person's own answers back to them.

export type Ease = 'fast' | 'okay' | 'slow';
export interface Entry { day: string; rested: 1 | 2 | 3 | 4 | 5; ease: Ease; mixName?: string }

export const MAX_ENTRIES = 90;

/** Local calendar day as YYYY-MM-DD. */
export function dayKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** One entry per day: logging again the same day replaces it. Newest first, capped. */
export function logEntry(list: Entry[], e: Entry): Entry[] {
  const rest = list.filter((x) => x.day !== e.day);
  return [e, ...rest].sort((a, b) => (a.day < b.day ? 1 : -1)).slice(0, MAX_ENTRIES);
}

export interface WeekSummary {
  /** Last 7 calendar days, oldest first; rested is null for days with no entry. */
  days: { day: string; rested: number | null }[];
  logged: number;
  avgRested: number | null;
  /** Mix name used on the nights rated 4 or 5, most common first. */
  topMix: string | null;
}

export function weekSummary(list: Entry[], today: Date): WeekSummary {
  const byDay = new Map(list.map((e) => [e.day, e]));
  const days: WeekSummary['days'] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const k = dayKey(d);
    days.push({ day: k, rested: byDay.get(k)?.rested ?? null });
  }
  const got = days.filter((d) => d.rested != null) as { day: string; rested: number }[];
  const avg = got.length ? Math.round((got.reduce((s, d) => s + d.rested, 0) / got.length) * 10) / 10 : null;
  const tally = new Map<string, number>();
  for (const d of got) {
    const e = byDay.get(d.day);
    if (e?.mixName && e.rested >= 4) tally.set(e.mixName, (tally.get(e.mixName) ?? 0) + 1);
  }
  const top = [...tally.entries()].sort((a, b) => b[1] - a[1])[0];
  return { days, logged: got.length, avgRested: avg, topMix: top ? top[0] : null };
}

export function parseEntries(json: string | null): Entry[] {
  if (!json) return [];
  try {
    const raw = JSON.parse(json);
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((e: any) => e && /^\d{4}-\d{2}-\d{2}$/.test(e.day) && [1, 2, 3, 4, 5].includes(e.rested) && ['fast', 'okay', 'slow'].includes(e.ease))
      .map((e: any) => ({ day: e.day, rested: e.rested, ease: e.ease, mixName: typeof e.mixName === 'string' ? e.mixName.slice(0, 24) : undefined }))
      .slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}
