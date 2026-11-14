// Layout rules for Dynamic Type, including the iOS accessibility sizes AX1–AX5.
// Pure: no native imports, so the column choice can be unit tested.

/** Minimum control size in points (iOS Human Interface Guidelines). */
export const MIN_TAP = 44;

/**
 * Approximate iOS content-size scales relative to the default Large size.
 * AX1 accessibilityMedium … AX5 accessibilityExtraExtraExtraLarge.
 */
export const AX_FONT_SCALE = {
  large: 1,
  xxxLarge: 1.35,
  ax1: 1.65,
  ax2: 1.94,
  ax3: 2.35,
  ax4: 2.76,
  ax5: 3.12,
} as const;

/**
 * Sound-grid columns. AX1–AX2 use two columns and AX3–AX5 use one, so a
 * single-word name such as "Underwater" stays inside the tile.
 */
export function gridColumns(fontScale: number): number {
  if (!Number.isFinite(fontScale) || fontScale < 1.5) return 3;
  if (fontScale < 2.2) return 2;
  return 1;
}
