import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';

// Ask for an App Store rating after a real success moment (ASO plan, 27 Nov 2026).
// Apple caps the system prompt at 3 per year and hides it for users who already rated;
// we add our own guard: only after `minWins` successes, at most 3 asks, 30+ days apart.
const KEY = 'review_prompt_v1';
type S = { wins: number; asks: number; lastAsk: number };
const DAY = 24 * 60 * 60 * 1000;

export async function noteSuccess(minWins = 2): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const s: S = raw ? JSON.parse(raw) : { wins: 0, asks: 0, lastAsk: 0 };
    s.wins += 1;
    const due = s.wins >= minWins && s.asks < 3 && Date.now() - s.lastAsk > 30 * DAY;
    if (due && (await StoreReview.hasAction())) {
      s.asks += 1;
      s.lastAsk = Date.now();
      await AsyncStorage.setItem(KEY, JSON.stringify(s));
      setTimeout(() => { StoreReview.requestReview().catch(() => {}); }, 900);
      return;
    }
    await AsyncStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // never block the user flow on a rating prompt
  }
}
