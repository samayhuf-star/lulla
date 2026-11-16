// "My nights": saved sound mixes with names. Pure logic; storage is in src/nightsStore.ts.

export interface MixItem { id: string; vol: number }
export interface SavedMix { id: string; name: string; items: MixItem[]; createdMs: number }

export const MAX_SAVED = 20;
export const MAX_NAME = 24;

export const cleanName = (raw: string) => raw.replace(/\s+/g, ' ').trim().slice(0, MAX_NAME);

/** Default name when the user leaves it blank: "Night 1", "Night 2", ... */
export function defaultName(list: SavedMix[]): string {
  let n = list.length + 1;
  const names = new Set(list.map((m) => m.name.toLowerCase()));
  while (names.has(`night ${n}`)) n += 1;
  return `Night ${n}`;
}

/** Adds a mix (newest first). A mix with the same name replaces the old one. Empty mixes are ignored. */
export function addMix(list: SavedMix[], rawName: string, items: MixItem[], nowMs: number): SavedMix[] {
  if (items.length === 0) return list;
  const name = cleanName(rawName) || defaultName(list);
  const clean = items.map((i) => ({ id: i.id, vol: Math.min(1, Math.max(0, i.vol)) }));
  const rest = list.filter((m) => m.name.toLowerCase() !== name.toLowerCase());
  const mix: SavedMix = { id: `m${nowMs}`, name, items: clean, createdMs: nowMs };
  return [mix, ...rest].slice(0, MAX_SAVED);
}

export const removeMix = (list: SavedMix[], id: string) => list.filter((m) => m.id !== id);

/** Parses stored JSON defensively. Unknown sound ids are dropped. */
export function parseMixes(json: string | null, knownIds: Set<string>): SavedMix[] {
  if (!json) return [];
  try {
    const raw = JSON.parse(json);
    if (!Array.isArray(raw)) return [];
    const out: SavedMix[] = [];
    for (const m of raw) {
      if (!m || typeof m.id !== 'string' || typeof m.name !== 'string' || !Array.isArray(m.items)) continue;
      const items: MixItem[] = m.items
        .filter((i: any) => i && typeof i.id === 'string' && knownIds.has(i.id))
        .map((i: any) => ({ id: i.id, vol: Math.min(1, Math.max(0, Number(i.vol) || 0)) }));
      if (items.length) out.push({ id: m.id, name: cleanName(m.name) || 'Night', items, createdMs: Number(m.createdMs) || 0 });
    }
    return out.slice(0, MAX_SAVED);
  } catch {
    return [];
  }
}
