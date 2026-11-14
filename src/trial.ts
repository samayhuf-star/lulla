import * as SecureStore from 'expo-secure-store';
import { FREE_SECONDS } from './config';

// Premium-sound preview time, stored in the OS keychain/keystore (SecureStore) rather than
// plain storage, so it survives app restarts and (on iOS) reinstalls. Only time spent playing
// a premium sound counts. The free sounds (src/access.ts) never use or need this clock.
const KEY = 'lulla_used_seconds_v1';

let used = 0;
let loaded = false;

export async function loadUsed(): Promise<number> {
  if (!loaded) {
    try {
      const v = await SecureStore.getItemAsync(KEY);
      used = v ? Math.max(0, parseInt(v, 10) || 0) : 0;
    } catch {
      used = 0;
    }
    loaded = true;
  }
  return used;
}

export function getUsed() {
  return used;
}

export function remainingSeconds() {
  return Math.max(0, FREE_SECONDS - used);
}

export function addUsed(sec: number) {
  used = Math.min(FREE_SECONDS, used + sec);
  return remainingSeconds();
}

export async function persistUsed() {
  try {
    await SecureStore.setItemAsync(KEY, String(used));
  } catch {
    /* best-effort */
  }
}

/** QA builds only: set the preview clock without touching SecureStore. */
export function setUsedForQa(sec: number) {
  used = Math.max(0, Math.min(FREE_SECONDS, sec));
  loaded = true;
  return remainingSeconds();
}
