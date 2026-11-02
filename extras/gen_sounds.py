"""Synthesize seamless, original ambient loops for Lulla (no third-party audio, no licensing issues)."""
import os, subprocess, sys
import numpy as np
from scipy.signal import butter, sosfilt

SR = 44100
DUR = 24  # seconds, loops seamlessly via crossfade
N = SR * DUR
rng = np.random.default_rng(7)
OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)


def band(x, lo=None, hi=None, order=2):
    if lo and hi:
        sos = butter(order, [lo, hi], btype="band", fs=SR, output="sos")
    elif hi:
        sos = butter(order, hi, btype="low", fs=SR, output="sos")
    else:
        sos = butter(order, lo, btype="high", fs=SR, output="sos")
    return sosfilt(sos, x)


def white(n=N):
    return rng.standard_normal(n)


def brown(n=N):
    x = np.cumsum(white(n))
    x -= np.linspace(x[0], x[-1], n)  # remove drift
    return x / np.max(np.abs(x))


def pink(n=N):
    f = np.fft.rfft(white(n))
    k = np.arange(len(f)); k[0] = 1
    return np.fft.irfft(f / np.sqrt(k), n)


def lfo(freq, phase=0.0, n=N):
    t = np.arange(n) / SR
    return 0.5 * (1 + np.sin(2 * np.pi * freq * t + phase))


def smooth_noise(rate, n=N):
    """slow random envelope 0..1, periodic over the loop."""
    pts = max(int(DUR * rate), 4)
    v = rng.random(pts)
    xp = np.linspace(0, n, pts + 1)
    y = np.interp(np.arange(n), xp, np.append(v, v[0]))
    return band(y, hi=max(rate * 2, 0.5), order=1) if False else y


def impulses(rate, decay_ms, hp=None, lp=None, n=N, amp_var=1.0):
    x = np.zeros(n)
    k = int(rate * DUR)
    idx = rng.integers(0, n, k)
    x[idx] = rng.random(k) ** amp_var * rng.choice([-1, 1], k)
    L = int(SR * decay_ms / 1000)
    env = np.exp(-np.arange(L) / (L / 5))
    y = np.convolve(x, env, mode="full")[:n]
    if hp: y = band(y, lo=hp)
    if lp: y = band(y, hi=lp)
    return y


def norm(x, peak=0.8):
    x = x - np.mean(x)
    return x / (np.max(np.abs(x)) + 1e-9) * peak


def loopify(x, fade_s=2.0):
    """Crossfade tail into head so the loop is seamless."""
    f = int(fade_s * SR)
    head, tail = x[:f].copy(), x[-f:].copy()
    w = np.linspace(0, 1, f)
    body = x[: len(x) - f].copy()
    body[:f] = head * w + tail * (1 - w)
    return body


sounds = {}

# --- Rain family
rain = band(white(), lo=800, hi=9000) * 0.6 + impulses(900, 6, hp=2500, lp=11000) * 0.5
sounds["rain"] = rain
sounds["rain_window"] = band(white(), lo=400, hi=5000) * 0.5 + impulses(80, 25, hp=600, lp=3500, amp_var=2) * 1.2
sounds["rain_roof"] = band(white(), lo=1500, hi=9000) * 0.4 + impulses(350, 10, hp=1800, lp=8000, amp_var=2) * 1.0
sounds["rain_umbrella"] = band(white(), lo=300, hi=6000) * 0.35 + impulses(220, 14, hp=900, lp=5000, amp_var=2.5) * 1.1
sounds["rain_puddle"] = band(white(), lo=500, hi=4500) * 0.3 + impulses(60, 40, hp=300, lp=1800, amp_var=2) * 1.4
sounds["snow"] = band(pink(), lo=150, hi=900) * (0.2 + 0.5 * smooth_noise(0.15))

# --- Water
wave = (0.35 + 0.65 * lfo(1 / 8.0)) ** 1.6
sounds["ocean"] = band(pink(), hi=2500) * wave + band(white(), lo=2000, hi=7000) * 0.15 * wave ** 3
wave2 = (0.4 + 0.6 * lfo(1 / 12.0, 1.0)) ** 2
sounds["lake"] = band(pink(), hi=900) * 0.6 * wave2 + impulses(6, 120, hp=300, lp=1500) * 0.35
sounds["creek"] = band(white(), lo=500, hi=4500) * (0.5 + 0.5 * smooth_noise(2.5)) + impulses(120, 12, hp=900, lp=5000) * 0.6
sounds["waterfall"] = band(white(), lo=200, hi=8000) * 0.8 + band(pink(), hi=400) * 0.5
sounds["underwater"] = band(brown(), hi=500) * 1.0 + band(pink(), lo=60, hi=250) * 0.4 * lfo(1 / 6.0)
sounds["drip"] = impulses(0.9, 180, hp=700, lp=2200, amp_var=0.2) * 1.5 + band(brown(), hi=200) * 0.02

# --- Wind & nature
gust = (0.25 + 0.75 * smooth_noise(0.25)) ** 1.5
sounds["wind"] = band(pink(), lo=120, hi=1800) * gust
sounds["wind_leaves"] = band(pink(), lo=200, hi=1500) * gust * 0.6 + band(white(), lo=3500, hi=9000) * (smooth_noise(0.5) ** 3) * 0.35
sounds["forest"] = band(pink(), lo=100, hi=1200) * (0.3 + 0.4 * smooth_noise(0.2)) + band(white(), lo=3000, hi=8000) * 0.05 * smooth_noise(0.7)
sounds["night"] = band(pink(), lo=80, hi=600) * 0.25 + impulses(14, 60, hp=2800, lp=4500) * 0.18  # crickets-ish ticks
sounds["cave"] = band(brown(), hi=300) * 0.9 + impulses(4, 400, hp=200, lp=1200) * 0.3
sounds["grassland"] = band(pink(), lo=150, hi=1400) * gust * 0.5 + band(white(), lo=4000, hi=9000) * 0.04
sounds["farm"] = band(pink(), lo=120, hi=1000) * 0.3 + impulses(0.4, 300, hp=300, lp=900) * 0.4

# --- Fire
crackle = impulses(55, 8, hp=1500, lp=9000, amp_var=3) * 1.3
sounds["fire"] = crackle + band(brown(), hi=350) * 0.7 * (0.6 + 0.4 * smooth_noise(0.6))

# --- Colored noise & hums
sounds["white_noise"] = white() * 0.5
sounds["pink_noise"] = pink()
sounds["brown_noise"] = brown()
sounds["fan"] = band(pink(), lo=60, hi=3000) * 0.7 + band(white(), lo=120, hi=240) * 0.4
sounds["thunder"] = band(brown(), hi=250) * (smooth_noise(0.08) ** 4) * 3 + band(brown(), hi=1200) * 0.12

manifest = []
for name, x in sounds.items():
    x = loopify(norm(np.asarray(x, dtype=np.float64)))
    x = norm(x, 0.85)
    pcm = (x * 32767).astype("<i2").tobytes()
    raw = os.path.join(OUT, name + ".raw")
    with open(raw, "wb") as f:
        f.write(pcm)
    mp3 = os.path.join(OUT, name + ".mp3")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "s16le", "-ar", str(SR), "-ac", "1",
                    "-i", raw, "-c:a", "libmp3lame", "-b:a", "64k", mp3], check=True)
    os.remove(raw)
    manifest.append(name)
    print("ok", name, os.path.getsize(mp3) // 1024, "KB")
