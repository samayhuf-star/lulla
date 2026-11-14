import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AX_FONT_SCALE, MIN_TAP, gridColumns } from '../src/axLayout.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'App.tsx'), 'utf8');
const hero = readFileSync(join(root, 'src/FrequenciesHero.tsx'), 'utf8');

const style = (src: string, name: string) => {
  const m = src.match(new RegExp(`\\n  ${name}: \\{([^}]*)\\}`));
  assert.ok(m, `style ${name} exists`);
  return m[1];
};

const minTap = (src: string, name: string) => {
  const body = style(src, name);
  const h = Number(body.match(/(?:minH|h)eight: (\d+)/)?.[1] ?? 0);
  const w = Number(body.match(/(?:minW|w)idth: (\d+)/)?.[1] ?? h);
  return { h, w };
};

describe('Dynamic Type columns (AX1–AX5)', () => {
  it('keeps 3 columns at default and xxxLarge, 2 at AX1–AX2, 1 at AX3–AX5', () => {
    assert.equal(gridColumns(AX_FONT_SCALE.large), 3);
    assert.equal(gridColumns(AX_FONT_SCALE.xxxLarge), 3);
    assert.equal(gridColumns(1.49), 3);
    assert.equal(gridColumns(AX_FONT_SCALE.ax1), 2);
    assert.equal(gridColumns(AX_FONT_SCALE.ax2), 2);
    assert.equal(gridColumns(2.19), 2);
    assert.equal(gridColumns(AX_FONT_SCALE.ax3), 1);
    assert.equal(gridColumns(AX_FONT_SCALE.ax4), 1);
    assert.equal(gridColumns(AX_FONT_SCALE.ax5), 1);
    assert.equal(gridColumns(Number.NaN), 3);
  });
});

describe('tap targets and rows that used to clip', () => {
  it('every listed control is at least 44pt, with no truncated (numberOfLines) labels', () => {
    assert.equal(MIN_TAP, 44);
    for (const name of ['chip', 'pill', 'sideBtn', 'timerRow', 'removeBtn', 'volCell', 'cta', 'clear', 'link', 'linkHit']) {
      const { h } = minTap(app, name);
      assert.ok(h >= MIN_TAP, `${name} min height ${h}`);
    }
    for (const name of ['gear', 'close', 'playBtn']) {
      const { h, w } = minTap(app, name);
      assert.ok(h >= MIN_TAP && w >= MIN_TAP, `${name} is ${w}x${h}`);
    }
    assert.doesNotMatch(style(app, 'chip'), /(^|[\s,{])height:/);
    assert.doesNotMatch(app, /numberOfLines/);
    assert.doesNotMatch(hero, /numberOfLines/);
    assert.doesNotMatch(app, /ellipsizeMode/);
  });

  it('mix, header, link and tile rows wrap instead of using a fixed label width', () => {
    assert.match(style(app, 'mixRow'), /flexWrap: 'wrap'/);
    assert.match(style(app, 'mixLabel'), /flexBasis: '100%'/);
    assert.doesNotMatch(style(app, 'mixName'), /width:/);
    assert.doesNotMatch(app, /width: 130/);
    assert.match(style(app, 'links'), /flexWrap: 'wrap'/);
    assert.match(style(app, 'grid'), /flexWrap: 'wrap'/);
    assert.match(app, /gridColumns\(fontScale\)/);
    assert.match(app, /<Sheet title="Your mix">/);
    assert.match(app, /<Sheet title="Sleep timer">/);
    assert.match(app, /<Sheet title="Settings">/);
    assert.match(app, /contentContainerStyle=\{styles\.payScroll\}/);
  });

  it('hero title cap keeps the word "Frequencies" on one line at AX5 on a 375pt phone', () => {
    const cap = Number(hero.match(/styles\.title\} maxFontSizeMultiplier=\{([0-9.]+)\}/)?.[1]);
    assert.ok(cap >= 1.5 && cap <= 2, `hero title cap ${cap} still grows, and still fits`);
    // Conservative advance width for a heavy sans (0.7em) on the narrowest current iPhone.
    const inner = 375 - 32 - 36 - 44; // screen, hero margins, card padding, chevron
    const width = 'Frequencies'.length * 20 * cap * 0.7;
    assert.ok(width <= inner, `Frequencies at ${cap}x is ${width}pt, card text is ${inner}pt`);
    const uncapped = 'Frequencies'.length * 20 * AX_FONT_SCALE.ax5 * 0.7;
    assert.ok(uncapped > inner, 'without the cap the word would break mid-glyph at AX5');
  });
});
