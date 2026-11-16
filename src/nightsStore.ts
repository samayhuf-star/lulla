import AsyncStorage from '@react-native-async-storage/async-storage';
import { SOUNDS } from './catalog';
import { parseMixes, type SavedMix } from './mixesLogic';
import { parseEntries, type Entry } from './journalLogic';

// Everything here stays on the device. Nothing is sent anywhere.
const MIXES_KEY = 'lulla_nights_v1';
const JOURNAL_KEY = 'lulla_journal_v1';
const KNOWN = new Set<string>(SOUNDS.map((s) => s.id));

export async function loadMixes(): Promise<SavedMix[]> {
  try { return parseMixes(await AsyncStorage.getItem(MIXES_KEY), KNOWN); } catch { return []; }
}
export async function saveMixes(list: SavedMix[]): Promise<void> {
  try { await AsyncStorage.setItem(MIXES_KEY, JSON.stringify(list)); } catch { /* best effort */ }
}
export async function loadJournal(): Promise<Entry[]> {
  try { return parseEntries(await AsyncStorage.getItem(JOURNAL_KEY)); } catch { return []; }
}
export async function saveJournal(list: Entry[]): Promise<void> {
  try { await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(list)); } catch { /* best effort */ }
}
