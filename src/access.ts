// Which sounds a listener may play. Pure logic, no native imports, so it can be unit tested.
//
// Free tier: FREE_SOUND_IDS play forever, with no time limit, for everyone.
// Premium sounds: a short preview (FREE_SECONDS in config, counted only while a premium
// sound is in the playing mix). Once the preview is used, tapping a premium sound opens
// the paywall. The preview never limits the free sounds.

export const FREE_SOUND_IDS = ['rain', 'ocean', 'white_noise', 'brown_noise', 'fan', 'forest'] as const;

const FREE = new Set<string>(FREE_SOUND_IDS);

export const isFreeSound = (id: string) => FREE.has(id);

/** Badge state for a tile: true shows the Premium lock badge. */
export const isLocked = (id: string, premium: boolean) => !premium && !isFreeSound(id);

export interface Access {
  premium: boolean;
  /** Seconds left in the premium-sound preview. */
  previewLeft: number;
}

/** May this sound start playing right now? */
export const canPlay = (id: string, a: Access) => a.premium || isFreeSound(id) || a.previewLeft > 0;

/** What a tap on a sound tile does. */
export function tileAction(id: string, a: Access): 'toggle' | 'paywall' {
  return canPlay(id, a) ? 'toggle' : 'paywall';
}

/** Sounds in the mix that must be removed before the mix may (re)start. */
export function blockedInMix(ids: string[], a: Access): string[] {
  return ids.filter((id) => !canPlay(id, a));
}

/** The preview clock only runs while a premium sound is in the playing mix. */
export function countsTowardPreview(ids: string[], premium: boolean): boolean {
  return !premium && ids.some((id) => !isFreeSound(id));
}

/**
 * When the preview runs out mid-play: drop the premium sounds and keep the free ones
 * playing. Only when nothing free is left does playback pause and the paywall open.
 */
export function onPreviewEnded(ids: string[]): { remove: string[]; pauseAndPaywall: boolean } {
  const remove = ids.filter((id) => !isFreeSound(id));
  return { remove, pauseAndPaywall: remove.length > 0 && remove.length === ids.length };
}

export const PAYWALL_TITLE = 'Unlock all sounds';
export const PAYWALL_SUB = 'Your free sounds stay free, with no time limit. Premium opens the full library.';
