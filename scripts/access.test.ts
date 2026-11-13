import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  FREE_SOUND_IDS, PAYWALL_SUB, PAYWALL_TITLE, blockedInMix, canPlay, countsTowardPreview, isFreeSound, isLocked,
  onPreviewEnded, tileAction,
} from '../src/access.ts';
import { parseQaUrl } from '../src/qa.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel: string) => readFileSync(join(root, rel), 'utf8');
const app = read('App.tsx');
const catalog = read('src/catalog.ts');
const catalogIds = [...catalog.matchAll(/\{ id: '([a-z0-9_]+)'/g)].map((m) => m[1]);
const PREMIUM_IDS = catalogIds.filter((id) => !isFreeSound(id));

const USED_UP = { premium: false, previewLeft: 0 };
const FRESH = { premium: false, previewLeft: 180 };
const PREMIUM = { premium: true, previewLeft: 0 };

describe('free tier', () => {
  it('has about six free sounds, all real catalog ids', () => {
    assert.equal(catalogIds.length, 38);
    assert.ok(FREE_SOUND_IDS.length >= 5 && FREE_SOUND_IDS.length <= 8);
    for (const id of FREE_SOUND_IDS) assert.ok(catalogIds.includes(id), `${id} is not in the catalog`);
    assert.deepEqual([...FREE_SOUND_IDS].sort(), ['brown_noise', 'fan', 'forest', 'ocean', 'rain', 'white_noise']);
  });

  it('free sounds play with the preview used up, forever', () => {
    for (const id of FREE_SOUND_IDS) {
      assert.equal(canPlay(id, USED_UP), true, id);
      assert.equal(tileAction(id, USED_UP), 'toggle', id);
      assert.equal(isLocked(id, false), false, id);
    }
    assert.deepEqual(blockedInMix([...FREE_SOUND_IDS], USED_UP), []);
  });

  it('free sounds never run the preview clock', () => {
    assert.equal(countsTowardPreview([...FREE_SOUND_IDS], false), false);
    assert.equal(countsTowardPreview(['rain', 'snow'], false), true);
    assert.equal(countsTowardPreview(['rain', 'snow'], true), false);
  });

  it('when the preview ends mid-play, free sounds keep playing and no paywall opens', () => {
    assert.deepEqual(onPreviewEnded(['rain', 'snow', 'fan']), { remove: ['snow'], pauseAndPaywall: false });
    assert.deepEqual(onPreviewEnded(['snow', 'cave']), { remove: ['snow', 'cave'], pauseAndPaywall: true });
    assert.deepEqual(onPreviewEnded(['rain']), { remove: [], pauseAndPaywall: false });
  });
});

describe('premium sounds', () => {
  it('every other sound carries the Premium badge until premium is active', () => {
    assert.equal(PREMIUM_IDS.length, 38 - FREE_SOUND_IDS.length);
    for (const id of PREMIUM_IDS) {
      assert.equal(isLocked(id, false), true, id);
      assert.equal(isLocked(id, true), false, id);
    }
    assert.match(app, /🔒 Premium/);
    assert.match(app, /isLocked\(item\.id, premium\)/);
  });

  it('a locked sound opens the paywall once the preview is used up', () => {
    for (const id of PREMIUM_IDS) assert.equal(tileAction(id, USED_UP), 'paywall', id);
    assert.deepEqual(blockedInMix(['rain', 'snow'], USED_UP), ['snow']);
  });

  it('plays during the preview and with premium', () => {
    for (const id of PREMIUM_IDS) {
      assert.equal(tileAction(id, FRESH), 'toggle', id);
      assert.equal(tileAction(id, PREMIUM), 'toggle', id);
    }
  });

  it('the tile tap, play button and lock screen all use the same gate', () => {
    assert.match(app, /tileAction\(id, \{ premium, previewLeft: remainingSeconds\(\) \}\) === 'paywall'/);
    assert.match(app, /mixer\.setRemotePlayGuard\(\(\) => \{\s*if \(!stripBlocked\(\)\)/);
    assert.match(app, /else if \(stripBlocked\(\)\)/);
    // QA builds no longer skip the gate; only the explicit qa/play audio check does.
    assert.doesNotMatch(app, /premiumRef\.current \|\| QA_MODE/);
    assert.doesNotMatch(app, /!premiumRef\.current && !QA_MODE/);
  });
});

describe('paywall', () => {
  it('has a visible X that only closes the paywall', () => {
    assert.match(app, /onPress=\{onClose\}[^>]*accessibilityLabel="Close"/);
    assert.match(app, /onClose=\{\(\) => setShowPaywall\(false\)\}/);
    assert.match(app, /<Text style=\{styles\.closeText\}>✕<\/Text>/);
  });

  it('keeps Restore purchases on the paywall', () => {
    assert.match(app, /<Pressable onPress=\{doRestore\}><Text style=\{styles\.link\}>Restore purchases<\/Text>/);
  });

  it('copy is neutral: no 3-minute line, no ellipsis, no AI mentions', () => {
    assert.equal(PAYWALL_TITLE, 'Unlock all sounds');
    for (const text of [app, read('src/access.ts'), PAYWALL_SUB]) {
      assert.doesNotMatch(text, /free 3 minutes|3 minutes are up|minutes are up/i);
      assert.doesNotMatch(text, /…/);
      assert.doesNotMatch(text, /\bAI\b|artificial intelligence/);
    }
    assert.match(app, /\{PAYWALL_TITLE\}/);
    assert.match(app, /plan\.price/); // localized store price, never hard-coded
  });
});

describe('Restore purchases outside the paywall', () => {
  it('the header gear opens a settings sheet with Restore purchases wired to expo-iap restore()', () => {
    assert.match(app, /accessibilityLabel="Settings"/);
    assert.match(app, /onPress=\{\(\) => setShowSettings\(true\)\}/);
    const sheet = app.slice(app.indexOf('{/* Settings sheet'), app.indexOf('</Modal>', app.indexOf('{/* Settings sheet')));
    assert.match(sheet, /runRestore\(/);
    assert.match(sheet, />Restore purchases</);
    const fn = app.slice(app.indexOf('async function runRestore'), app.indexOf('function Paywall'));
    assert.match(fn, /await restore\(\)/);
    assert.match(read('src/purchases.ts'), /from 'expo-iap'/);
    assert.doesNotMatch(app + read('src/purchases.ts'), /RevenueCat|react-native-purchases/);
  });
});

describe('QA deep links for the free tier run', () => {
  it('parses tap, close, settings and preview commands', () => {
    assert.deepEqual(parseQaUrl('lulla://qa/tap/snow'), { kind: 'tap', id: 'snow' });
    assert.equal(parseQaUrl('lulla://qa/tap/rain,snow'), null);
    assert.equal(parseQaUrl('lulla://qa/tap'), null);
    assert.deepEqual(parseQaUrl('lulla://qa/close'), { kind: 'close' });
    assert.deepEqual(parseQaUrl('lulla://qa/settings'), { kind: 'settings' });
    assert.deepEqual(parseQaUrl('lulla://qa/preview/used'), { kind: 'preview', state: 'used' });
    assert.deepEqual(parseQaUrl('lulla://qa/preview/reset'), { kind: 'preview', state: 'reset' });
    assert.equal(parseQaUrl('lulla://qa/preview/forever'), null);
    assert.equal(parseQaUrl('lulla://qa/close/x'), null);
  });

  it('a QA tap goes through the same tapTile path as a finger tap', () => {
    const calls = app.match(/tapTile\(/g) ?? [];
    assert.equal(calls.length, 3); // definition, onTile, QA tap
  });
});
