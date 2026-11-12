// Pre-build gate for build 8 audio. Run: npm run check:sounds
// Fails if any catalog sound is still pending, too small, or missing from ASSET_LICENSES.md.
import { readFileSync, statSync, existsSync } from 'node:fs';
const catalog = readFileSync('src/catalog.ts', 'utf8');
const files = [...catalog.matchAll(/require\('\.\.\/assets\/sounds\/([a-z_]+\.m4a)'\)/g)].map((m) => m[1]);
const pending = JSON.parse(readFileSync('assets/sounds/PENDING.json', 'utf8')).pending;
const lic = readFileSync('ASSET_LICENSES.md', 'utf8');
const problems = [];
if (pending.length) problems.push(`pending masters: ${pending.join(', ')}`);
for (const f of files) {
  const p = `assets/sounds/${f}`;
  if (!existsSync(p)) { problems.push(`missing ${f}`); continue; }
  if (statSync(p).size < 1_500_000) problems.push(`${f} is under 1.5 MB (placeholder?)`);
  if (!lic.includes('`' + f + '`')) problems.push(`${f} not in ASSET_LICENSES.md`);
}
const total = files.reduce((n, f) => n + (existsSync(`assets/sounds/${f}`) ? statSync(`assets/sounds/${f}`).size : 0), 0);
console.log(`${files.length} sounds, ${(total / 1e6).toFixed(1)} MB of audio`);
if (problems.length) { console.error('NOT READY:\n- ' + problems.join('\n- ')); process.exit(1); }
console.log('All build 8 sounds ready.');
