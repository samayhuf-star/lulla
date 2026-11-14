// Renders web approximations of the build 10 layout at Dynamic Type default (1.0)
// and AX5 (3.12). Not an iOS Simulator capture. Output: ./screenshots/*.png
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, 'screenshots');
const htmlPath = '/tmp/lulla-ax-preview.html';
const hero = 'file:///workspace/assets/hero/frequencies-hero@2x.png';
const port = 9334;

const shots = [
  ['home-default', 'home', 1, ''],
  ['home-ax5', 'home', 3.12, ''],
  ['home-ax5-chips', 'home', 3.12, 'chips'],
  ['mix-default', 'mix', 1, ''],
  ['mix-ax5', 'mix', 3.12, ''],
  ['timer-default', 'timer', 1, ''],
  ['timer-ax5', 'timer', 3.12, ''],
  ['paywall-default', 'paywall', 1, ''],
  ['paywall-ax5', 'paywall', 3.12, ''],
  ['paywall-ax5-links', 'paywall', 3.12, 'links'],
  ['settings-default', 'settings', 1, ''],
  ['settings-ax5', 'settings', 3.12, ''],
  ['credits-default', 'credits', 1, ''],
  ['credits-ax5', 'credits', 3.12, ''],
];

function page() {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; background: #0e061c; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  #shot { width: 402px; }
  .caption {
    height: 78px; padding: 10px 14px; background: #1a1028; color: #f5f3ff;
    font-size: 13px; line-height: 18px; border-bottom: 1px solid rgba(167,139,250,0.35);
  }
  .caption strong { color: #fde68a; }
  .phone {
    width: 402px; height: 874px; position: relative; overflow: hidden;
    background: linear-gradient(180deg, #150a2e, #2a1050 55%, #0b2a4a);
    color: #f5f3ff;
  }
  .status { height: 54px; padding: 14px 20px 0; font-size: 15px; font-weight: 600; }
  .scroll { position: absolute; top: 54px; left: 0; right: 0; bottom: 0; overflow: auto; }
  .scroll::-webkit-scrollbar { width: 0; height: 0; }
  .header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; padding: 12px 20px 8px; }
  .header-title { flex: 1 1 180px; min-width: 0; }
  .header-right { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; max-width: 100%; }
  .pill {
    min-height: 44px; max-width: 100%; padding: 8px 14px; border-radius: 999px;
    background: rgba(167,139,250,0.25); display: flex; align-items: center; justify-content: center;
    font-weight: 700; text-align: center;
  }
  .gear {
    width: 44px; height: 44px; border-radius: 22px; margin-left: 0;
    background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center;
  }
  .hero {
    margin: 4px 16px; min-height: 122px; border-radius: 22px; overflow: hidden;
    border: 1px solid rgba(196,181,253,0.35);
    background: #0a0c2e url("${hero}") right center / cover no-repeat;
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 18px; position: relative;
  }
  .hero::before {
    content: ""; position: absolute; inset: 0;
    background: linear-gradient(90deg, rgba(10,12,46,0.88), rgba(10,12,46,0.35) 55%, rgba(10,12,46,0));
  }
  .hero-text, .hero-chev { position: relative; }
  .hero-text { width: 52%; }
  .hero-text.wide { width: auto; flex: 1 1 auto; min-width: 0; }
  .hero h2 { margin: 0; font-weight: 800; text-shadow: 0 0 6px rgba(0,0,0,0.6); }
  .hero p { margin: 3px 0 0; color: #ddd6fe; }
  .hero-chev { margin-left: 8px; font-size: 26px; font-weight: 300; flex: none; }
  .chips { display: flex; gap: 8px; padding: 8px 16px; overflow-x: auto; min-height: 44px; }
  .chip {
    flex: none; min-height: 44px; padding: 10px 14px; border-radius: 999px;
    background: rgba(255,255,255,0.08); color: #c4b5fd; font-weight: 600;
    display: flex; align-items: center; white-space: nowrap;
  }
  .chip.on { background: #7c3aed; color: #fff; }
  .grid { display: flex; flex-wrap: wrap; padding: 4px 7px 150px; }
  .cell { padding: 5px; }
  .tile {
    min-height: 110px; background: rgba(255,255,255,0.08); border-radius: 18px;
    padding: 8px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;
  }
  .badge, .lock {
    align-self: stretch; border-radius: 999px; padding: 3px 6px; margin-bottom: 6px; font-weight: 800; text-align: center;
  }
  .lock { background: rgba(0,0,0,0.45); color: #fde68a; }
  .badge { background: rgba(167,139,250,0.3); color: #f5f3ff; margin-top: 4px; margin-bottom: 0; }
  .player {
    position: absolute; left: 16px; right: 16px; bottom: 24px;
    background: rgba(20,10,46,0.92); border: 1px solid rgba(167,139,250,0.3); border-radius: 28px;
    display: flex; align-items: center; padding: 8px;
  }
  .side { flex: 1; min-width: 0; min-height: 44px; text-align: center; color: #c4b5fd; font-weight: 600; padding: 4px 2px; }
  .side span { display: block; width: 100%; }
  .play {
    width: 64px; height: 64px; border-radius: 32px; background: #7c3aed; color: #fff;
    display: flex; align-items: center; justify-content: center; flex: none; font-weight: 800;
  }
  .dim { position: absolute; inset: 0; background: rgba(0,0,0,0.5); }
  .sheet {
    position: absolute; left: 0; right: 0; bottom: 0; max-height: 92%;
    background: #1d0f3d; border-radius: 26px 26px 0 0; padding: 20px 20px 28px;
    display: flex; flex-direction: column;
  }
  .sheet h1 { margin: 0 0 12px; font-size: 20px; }
  .sheet-body { overflow: auto; }
  .sheet-body::-webkit-scrollbar { width: 0; }
  .mix { display: flex; flex-wrap: wrap; align-items: center; padding: 8px 0; }
  .mix-name { flex: 1 1 100%; font-weight: 600; }
  .mix-controls { flex: 1 1 100%; display: flex; align-items: center; }
  .dots { flex: 1; display: flex; }
  .dot { flex: 1; min-height: 44px; display: flex; align-items: center; justify-content: center; }
  .dot i { width: 70%; height: 6px; border-radius: 3px; background: rgba(255,255,255,0.15); display: block; }
  .dot.on i { background: #a78bfa; }
  .remove { min-width: 44px; min-height: 44px; display: flex; align-items: center; justify-content: center; color: #c4b5fd; font-size: 20px; }
  .row {
    min-height: 44px; padding: 12px 8px; text-align: center; font-weight: 600;
    border-bottom: 1px solid rgba(255,255,255,0.15);
  }
  .sub { color: #c4b5fd; margin: 0 0 8px; }
  .hp { color: #c4b5fd; font-size: 13px; margin-top: 2px; }
  .close {
    width: 44px; height: 44px; border-radius: 22px; margin-left: auto;
    background: rgba(255,255,255,0.12); display: flex; align-items: center; justify-content: center; font-weight: 700;
  }
  .pay { padding: 24px; }
  .moon { text-align: center; }
  .pay h1, .pay .lead, .perk, .fine { text-align: center; }
  .pay h1 { margin: 12px 0 0; }
  .lead { color: #c4b5fd; margin: 6px 0 16px; }
  .perk { margin: 6px 0; }
  .cta {
    min-height: 44px; margin-top: 10px; padding: 16px; border-radius: 999px; background: #7c3aed;
    text-align: center; font-weight: 800;
  }
  .fine { color: #c4b5fd; margin-top: 12px; }
  .links { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 8px; }
  .links a { color: #c4b5fd; min-height: 44px; padding: 12px 6px; text-decoration: underline; display: flex; align-items: center; }
  .credit { margin-top: 18px; }
  .credit p { color: #c4b5fd; line-height: 1.4; }
  .clear { min-height: 44px; display: flex; align-items: center; justify-content: center; color: #fda4af; font-weight: 700; }
</style>
</head>
<body>
<div id="shot">
  <div class="caption" id="caption"></div>
  <div class="phone" id="phone"></div>
</div>
<script>
const q = new URLSearchParams(location.search);
const scale = Number(q.get('scale') || '1');
const screen = q.get('screen') || 'home';
const focus = q.get('focus') || '';
const ax = scale >= 2;
const cap = (n, max) => n * Math.min(scale, max);
const fs = (n, max) => (max ? cap(n, max) : n * scale) + 'px';
const cols = scale < 1.5 ? 3 : scale < 2.2 ? 2 : 1;
const label = scale === 1
  ? 'Dynamic Type: default (font scale 1.0, iOS Large).'
  : 'Dynamic Type: maximum accessibility size AX5 (font scale 3.12).';
document.getElementById('caption').innerHTML =
  '<strong>Web approximation</strong> — not an iOS Simulator capture. ' + label +
  ' Layout mirrors the React Native styles: rows wrap or scroll, labels are not truncated, targets are at least 44pt.';

const chips = ['All','Rain','Water','Nature','Warmth','Hum','Calm','Lullaby','Binaural','Noise','Frequencies']
  .map((c, i) => '<div class="chip' + (i === 0 ? ' on' : '') + '" style="font-size:' + fs(14) + '">' + c + '</div>').join('');

const tiles = [
  ['🌧️','Rain', false, false],
  ['🏠','Deep Rain on Roof', true, false],
  ['⛺','Rain on Tent', true, false],
  ['🫧','Underwater', true, false],
  ['🎧','Delta Waves', true, true],
  ['🌙','432 Hz Deep Sleep', false, false],
];
const tileHtml = tiles.map(([emoji, name, locked, hp], idx) => \`
  <div class="cell" style="width:\${100 / cols}%" \${idx === 1 ? 'id="long-tile"' : ''}>
    <div class="tile" style="min-height:\${Math.max(44, Math.floor((402 - 24 - 10 * (cols - 1)) / cols))}px">
      \${locked ? '<div class="lock" style="font-size:' + fs(11) + '">🔒 Premium</div>' : ''}
      <div style="font-size:\${fs(34, 1.3)}">\${emoji}</div>
      <div style="font-size:\${fs(12)}; font-weight:600; margin-top:6px">\${name}</div>
      \${hp ? '<div class="badge" style="font-size:' + fs(11) + '">Use headphones</div>' : ''}
    </div>
  </div>\`).join('');

function home() {
  const wide = scale > 1.4 ? ' wide' : '';
  return \`
    <div class="status">9:41</div>
    <div class="scroll" id="scroll">
      <div class="header">
        <div class="header-title">
          <div style="font-size:\${fs(30, 2.2)}; font-weight:800">Lulla</div>
          <div style="font-size:\${fs(13)}; color:#c4b5fd; margin-top:2px">Sleep sounds, softly.</div>
        </div>
        <div class="header-right">
          <div class="pill" style="font-size:\${fs(13)}">Unlock all</div>
          <div class="gear" style="font-size:\${fs(18, 1.3)}">⚙️</div>
        </div>
      </div>
      <div class="hero">
        <div class="hero-text\${wide}">
          <h2 data-measure="freq" style="font-size:\${fs(20, 1.7)}">Frequencies</h2>
          <p style="font-size:\${fs(12)}; line-height:\${fs(16)}">432, 528 and 963 Hz tones over warm pads. 432 Hz Deep Sleep is free.</p>
        </div>
        <div class="hero-chev" style="font-size:\${fs(26, 1.5)}">›</div>
      </div>
      <div class="chips" id="chips">\${chips}</div>
      <div class="grid">\${tileHtml}</div>
    </div>
    <div class="player">
      <div class="side"><div style="font-size:\${fs(22, 1.3)}">🎚️</div><span style="font-size:\${fs(12)}">Mix</span></div>
      <div class="play" style="font-size:\${fs(22, 1.4)}">▶</div>
      <div class="side"><div style="font-size:\${fs(22, 1.3)}">⏱️</div><span style="font-size:\${fs(12)}">Timer</span></div>
    </div>\`;
}

function dots() {
  return '<div class="dots">' + Array.from({ length: 10 }, (_, i) =>
    '<div class="dot' + (i < 6 ? ' on' : '') + '"><i></i></div>').join('') + '</div>';
}
function mixRow(name, hp) {
  return \`<div class="mix">
    <div class="mix-name" style="font-size:\${fs(16)}">\${name}</div>
    \${hp ? '<div class="hp" style="flex:1 1 100%; font-size:' + fs(13) + '">Use headphones</div>' : ''}
    <div class="mix-controls">\${dots()}<div class="remove">✕</div></div>
  </div>\`;
}
function sheet(title, body) {
  return \`<div class="status">9:41</div>
    <div class="dim"></div>
    <div class="sheet">
      <h1 style="font-size:\${fs(20)}">\${title}</h1>
      <div class="sheet-body" id="scroll">\${body}</div>
    </div>\`;
}

const phone = document.getElementById('phone');
if (screen === 'home') phone.innerHTML = home();
if (screen === 'mix') phone.innerHTML = sheet('Your mix',
  mixRow('🏠 Deep Rain on Roof', false) + mixRow('🎧 Delta Waves', true) + mixRow('🌙 432 Hz Deep Sleep', false) +
  '<div class="clear" style="font-size:' + fs(16) + '">Clear all</div>');
if (screen === 'timer') phone.innerHTML = sheet('Sleep timer',
  ['10 minutes','15 minutes','30 minutes','45 minutes','1 hour','2 hours','3 hours','4 hours','All night']
    .map((t) => '<div class="row" style="font-size:' + fs(16) + '">' + t + '</div>').join(''));
if (screen === 'settings') phone.innerHTML = sheet('Settings',
  '<p class="sub" style="font-size:' + fs(15) + '; line-height:' + fs(22) + '">Rain, ocean, forest, fan, white and brown noise and 432 Hz Deep Sleep are free to play anytime.</p>' +
  ['Restore purchases','Unlock all sounds','Terms of Use','Privacy Policy','Sound credits','Support']
    .map((t) => '<div class="row" style="font-size:' + fs(16) + '">' + t + '</div>').join(''));
if (screen === 'paywall') phone.innerHTML = \`
  <div class="status">9:41</div>
  <div class="scroll pay" id="scroll">
    <div class="close" style="font-size:\${fs(20)}">✕</div>
    <div class="moon" style="font-size:\${fs(64, 1.5)}">🌙</div>
    <h1 style="font-size:\${fs(26)}">Unlock all sounds</h1>
    <p class="lead" style="font-size:\${fs(16)}; line-height:\${fs(22)}">Your free sounds stay free, with no time limit. Premium opens the full library.</p>
    \${['All 43 sleep sounds','Lullabies, binaural tones and every nature scene','Layer any of them into your own mix']
      .map((t) => '<div class="perk" style="font-size:' + fs(16) + '; line-height:' + fs(22) + '">✓  ' + t + '</div>').join('')}
    <div class="cta" style="font-size:\${fs(17)}">7 days free, then $2.99/month</div>
    <div class="cta" style="font-size:\${fs(17)}">7 days free, then $19.99/year</div>
    <p class="fine" style="font-size:\${fs(12)}; line-height:\${fs(18)}">After the free trial, the subscription starts automatically unless you cancel at least 24 hours before it ends. Subscriptions auto-renew until cancelled.</p>
    <div class="links" id="links">
      \${['Restore purchases','Terms','Privacy','Support'].map((t) => '<a style="font-size:' + fs(13) + '">' + t + '</a>').join('')}
    </div>
  </div>\`;
if (screen === 'credits') phone.innerHTML = \`
  <div class="status">9:41</div>
  <div class="scroll" id="scroll" style="padding:0 20px 40px">
    <div class="header" style="padding-left:0;padding-right:0">
      <div class="header-title" style="font-size:\${fs(20)}; font-weight:800">Sound credits</div>
      <div class="close" style="font-size:\${fs(20)}">✕</div>
    </div>
    <div class="credit">
      <div style="font-weight:700; font-size:\${fs(16)}">Farm</div>
      <p style="font-size:\${fs(14)}">"farmland at river-village Lage-Zwaluwe" by klankbeeld (Freesound 840052), licensed under CC BY 4.0. Changes: trimmed, equalised, compressed, level-matched and looped.</p>
      <a style="color:#c4b5fd; display:flex; align-items:center; min-height:44px; font-size:\${fs(13)}">Recording on Freesound</a>
      <a style="color:#c4b5fd; display:flex; align-items:center; min-height:44px; font-size:\${fs(13)}">CC BY 4.0 licence</a>
    </div>
    <div class="credit">
      <div style="font-weight:700; font-size:\${fs(16)}">Frequencies</div>
      <p style="font-size:\${fs(14)}">432 Hz Deep Sleep, 528 Hz Calm, 963 Hz Night, 432+528 Blend and Deep Drone are original loops by Samay Vashsht, made for Lulla.</p>
    </div>
  </div>\`;

const sc = document.getElementById('scroll');
if (focus === 'chips' && sc) {
  const chips = document.getElementById('chips');
  sc.scrollTop = Math.max(0, chips.offsetTop - 8);
}
if (focus === 'links') document.getElementById('links')?.scrollIntoView({ block: 'end' });
</script>
</body>
</html>`;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  writeFileSync(htmlPath, page());
  const chrome = spawn('google-chrome', [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    `--remote-debugging-port=${port}`,
    '--user-data-dir=/tmp/chrome-lulla-ax',
    'about:blank',
  ], { stdio: 'ignore' });
  try {
    let version;
    for (let i = 0; i < 40; i++) {
      try {
        version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
        break;
      } catch {
        await sleep(150);
      }
    }
    if (!version) throw new Error('Chrome did not open a debugging port');
    const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    const pageTarget = pages.find((t) => t.type === 'page');
    if (!pageTarget) throw new Error('no page target');
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve);
      ws.addEventListener('error', reject);
    });
    let seq = 0;
    const pending = new Map();
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    });
    const call = (method, params = {}) => new Promise((resolve, reject) => {
      const id = ++seq;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
    await call('Page.enable');
    await call('Emulation.setDeviceMetricsOverride', {
      width: 402, height: 78 + 874, deviceScaleFactor: 2, mobile: true,
    });
    for (const [name, screen, scale, focus] of shots) {
      const url = `file://${htmlPath}?screen=${screen}&scale=${scale}&focus=${focus}`;
      await call('Page.navigate', { url });
      await sleep(350);
      if (name === 'home-ax5') {
        const measured = await call('Runtime.evaluate', {
          expression: `(() => {
            const el = document.querySelector('[data-measure="freq"]');
            const box = el.parentElement.getBoundingClientRect();
            const r = el.getBoundingClientRect();
            return { word: r.width, box: box.width, text: el.textContent };
          })()`,
          returnByValue: true,
        });
        console.log('Frequencies measure', JSON.stringify(measured.result.value));
      }
      const shot = await call('Page.captureScreenshot', { format: 'png' });
      const file = join(outDir, `${name}.png`);
      writeFileSync(file, Buffer.from(shot.data, 'base64'));
      console.log('wrote', file);
    }
    ws.close();
  } finally {
    chrome.kill('SIGKILL');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
