import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'App.tsx'), 'utf8');
const hero = readFileSync(join(root, 'src/FrequenciesHero.tsx'), 'utf8');
const style = (src: string, name: string) => {
  const m = src.match(new RegExp(`\\n  ${name}: \\{([^}]*)\\}`));
  assert.ok(m, `style ${name} exists`);
  return m[1];
};

describe('home screen text is never clipped (Dynamic Type)', () => {
  it('category chips: no fixed height, minHeight + vertical padding, row is not squeezed', () => {
    const chip = style(app, 'chip');
    assert.doesNotMatch(chip, /(^|[\s,{])height:/);
    assert.match(chip, /minHeight: \d+/);
    assert.match(chip, /paddingVertical: \d+/);
    assert.doesNotMatch(style(app, 'chipText'), /lineHeight/);
    assert.match(style(app, 'catRow'), /flexShrink: 0/);
  });

  it('no lineHeight smaller than its fontSize anywhere on home or in the hero', () => {
    for (const src of [app, hero]) {
      for (const m of src.matchAll(/\{([^{}]*lineHeight[^{}]*)\}/g)) {
        const fs = Number(m[1].match(/fontSize: (\d+)/)?.[1] ?? 14);
        const lh = Number(m[1].match(/lineHeight: (\d+)/)![1]);
        assert.ok(lh >= fs, `lineHeight ${lh} >= fontSize ${fs} in {${m[1]}}`);
      }
    }
  });

  it('hero card and sound tiles grow with text instead of a fixed aspect ratio, no line caps', () => {
    assert.doesNotMatch(style(hero, 'card'), /aspectRatio/);
    assert.match(hero, /\{ minHeight \}/);
    assert.doesNotMatch(hero, /numberOfLines/);
    assert.doesNotMatch(style(app, 'tile'), /aspectRatio/);
    assert.match(app, /\{ minHeight: tileMin \}/);
    assert.doesNotMatch(app, /styles\.tileName\} numberOfLines/);
    assert.doesNotMatch(app, /allowFontScaling=\{false\}/);
  });
});
