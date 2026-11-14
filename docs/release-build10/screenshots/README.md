# Build 10 layout screenshots

Web approximations of the React Native layout. They are not iOS Simulator captures. Each image is labeled in the caption bar.

- **default** is Dynamic Type Large (font scale 1.0).
- **ax5** is the largest accessibility size, AX5 (font scale 3.12), the size that failed on build 9.

The phone frame is 402×874 CSS pixels, the logical size of the iPhone 17 Pro used in the build 9 sim run. Type is scaled with the same caps as the app (logo 2.2×, hero title 1.7× so “Frequencies” stays one word, decorative glyphs capped, body text uncapped). Rows wrap or scroll. Controls are at least 44pt.

| File | What it shows |
| --- | --- |
| `home-default.png` | Home at the default size: header on one row, hero, scrolling chips, 3-column grid. |
| `home-ax5.png` | Home at AX5, unscrolled: header wraps so “Unlock all” stays on screen, “Frequencies” is one word, the subtitle wraps. The chip row has moved down to the player; it scrolls into view. |
| `home-ax5-chips.png` | Same screen scrolled to the chip row. “All”, “Rain” and “Water” are complete. Tiles are one column. |
| `mix-default.png` / `mix-ax5.png` | Mix sheet. Names use the full row and wrap. The remove control stays a 44pt target. |
| `timer-default.png` / `timer-ax5.png` | Sleep timer. Rows grow with the text and the sheet scrolls. |
| `paywall-default.png` / `paywall-ax5.png` | Paywall. The title and plan buttons wrap. |
| `paywall-ax5-links.png` | Paywall scrolled to Restore, Terms, Privacy and Support. The link row wraps. |
| `settings-default.png` / `settings-ax5.png` | Settings. The free-sounds sentence and each row wrap. The sheet scrolls. |
| `credits-default.png` / `credits-ax5.png` | Sound credits. The title wraps beside the close button. Body text and links are full. |

Regenerate with `node docs/release-build10/render-screenshots.mjs` (needs Chrome).
