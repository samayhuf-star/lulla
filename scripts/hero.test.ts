import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HERO_CATEGORY, HERO_SUB, HERO_TITLE, heroMotion } from '../src/hero.ts';
import { parseQaUrl } from '../src/qa.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel: string) => readFileSync(join(root, rel), 'utf8');
const app = read('App.tsx');
const hero = read('src/FrequenciesHero.tsx');

describe('Frequencies hero card', () => {
  it('renders on home, full width, above the category chips', () => {
    const at = app.indexOf('<FrequenciesHero');
    assert.ok(at > 0, 'hero is rendered');
    assert.ok(at < app.indexOf('style={styles.catRow}'), 'hero comes before the category row');
    assert.match(hero, /testID="frequencies-hero"/);
    assert.match(hero, /marginHorizontal: 16/); // same side margins as the rest of home
    assert.match(hero, /LinearGradient/);
    assert.match(hero, /'#7c3aed', '#5b21b6', '#3730a3'/); // purple to indigo, from the app palette
  });

  it('tapping it selects the Frequencies category, with a light haptic', () => {
    assert.equal(HERO_CATEGORY, 'Frequencies');
    assert.match(read('src/catalog.ts'), /'Frequencies'\]/);
    assert.match(app, /onPress=\{onHero\}/);
    assert.match(app, /const onHero = \(\) => heroTap\(reduceMotion, setCat\);/);
    const fn = app.slice(app.indexOf('function heroTap'), app.indexOf('export default function App'));
    assert.match(fn, /select\(HERO_CATEGORY\)/);
    assert.match(fn, /ImpactFeedbackStyle\.Light/);
    assert.deepEqual(parseQaUrl('lulla://qa/hero'), { kind: 'hero' });
  });

  it('breathes slowly, and holds still under Reduce Motion', () => {
    const on = heroMotion(false);
    assert.equal(on.breathe, true);
    assert.ok(on.periodMs >= 6000, 'slow');
    assert.ok(on.max - on.min <= 0.5, 'subtle');
    const off = heroMotion(true);
    assert.equal(off.breathe, false);
    assert.match(hero, /if \(!m\.breathe\) \{\s*cancelAnimation\(glow\);\s*glow\.value = m\.rest;\s*return;/);
    assert.match(hero, /from 'react-native-reanimated'/);
    assert.match(app, /reduceMotion=\{reduceMotion\}/);
  });

  it('copy has no ellipsis, no AI mention and no health claim', () => {
    for (const t of [HERO_TITLE, HERO_SUB, hero]) {
      assert.doesNotMatch(t, /…|\.\.\./);
      assert.doesNotMatch(t, /\bAI\b/);
      assert.doesNotMatch(t, /heal|cure|therap|anxiety/i);
    }
  });
});
