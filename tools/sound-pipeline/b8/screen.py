#!/usr/bin/env python3
"""Content screen for originals (no ears): flags likely chimes/alarms (sustained narrow tonal
peaks), speech/announcements (2-8 Hz syllable-rate modulation in the 300-3400 Hz band) and
close animal calls / sharp events (short frames far above the median level).
Prints per-file stats and the times of suspicious segments.

  python screen.py <id> [<id> ...]
"""
import glob, json, os, sys
import numpy as np
from scipy.signal import stft, butter, sosfiltfilt
import master as M

def screen(sid):
    src = sorted(glob.glob(os.path.join(M.CFG['originals_dir'], '%s__*' % sid)))[0]
    x = M.decode(src).mean(1)
    sr = M.SR
    # 1) tonal: per 0.5 s frame, max peak prominence over local median (dB), 300-4000 Hz
    f, t, Z = stft(x, sr, nperseg=8192, noverlap=8192 - sr // 2)
    P = 20 * np.log10(np.abs(Z) + 1e-9)
    band = (f > 300) & (f < 4000)
    from scipy.ndimage import median_filter
    Pb = P[band]
    prom = Pb - median_filter(Pb, size=(61, 1))
    tonal = prom.max(axis=0)
    # sustained: same bin prominent > 18 dB for >= 1 s (2 frames)
    hot = prom > 18
    sustained = np.zeros(hot.shape[1], bool)
    for i in range(1, hot.shape[1]):
        sustained[i] = (hot[:, i] & hot[:, i - 1]).any()
    # 2) speech-rate modulation in 300-3400 Hz
    sos = butter(4, [300, 3400], 'bandpass', fs=sr, output='sos')
    env = np.abs(sosfiltfilt(sos, x))
    hop = sr // 100
    e = env[: len(env) // hop * hop].reshape(-1, hop).mean(1)  # 100 Hz envelope
    win = 300  # 3 s windows
    speech = []
    for i in range(0, len(e) - win, win // 2):
        seg = e[i:i + win] - e[i:i + win].mean()
        S = np.abs(np.fft.rfft(seg * np.hanning(win))) ** 2
        fr = np.fft.rfftfreq(win, 0.01)
        r = S[(fr >= 2) & (fr <= 8)].sum() / (S[(fr > 0.3) & (fr < 30)].sum() + 1e-12)
        speech.append((i / 100, r))
    sp = np.array([r for _, r in speech])
    # 3) events: 100 ms frames > 12 dB above median
    rd = 20 * np.log10(np.sqrt((x[: len(x) // (sr // 10) * (sr // 10)].reshape(-1, sr // 10) ** 2).mean(1)) + 1e-9)
    ev = np.where(rd > np.median(rd) + 12)[0] / 10
    res = dict(id=sid, file=os.path.basename(src), dur_s=round(len(x) / sr, 1),
               tonal_sustained_s=[round(float(t[i]), 1) for i in np.where(sustained)[0]][:40],
               tonal_sustained_frac=round(float(sustained.mean()), 3),
               speech_mod_median=round(float(np.median(sp)), 3), speech_mod_p95=round(float(np.percentile(sp, 95)), 3),
               speech_suspect_s=[t0 for t0, r in speech if r > max(0.5, np.median(sp) * 2)][:40],
               events_per_min=round(len(ev) / (len(x) / sr / 60), 1), events_s=[round(float(v), 1) for v in ev[:40]],
               level_sd_db=round(float(rd.std()), 2))
    return res

if __name__ == '__main__':
    out = {}
    for sid in sys.argv[1:]:
        r = screen(sid); out[sid] = r
        print(json.dumps(r), flush=True)
    p = '/home/box/shared/app-monitor/reports/lulla-b8/checks/screen.json'
    prev = json.load(open(p)) if os.path.exists(p) else {}
    prev.update(out); json.dump(prev, open(p, 'w'), indent=1)
