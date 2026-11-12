#!/usr/bin/env python3
"""Lulla build 8 mastering pipeline.

Lossless original -> 48 kHz float stereo -> EQ (high-pass, gentle high-shelf / low-pass,
optional notch and transient softening) -> steadiest window -> seamless equal-power loop
(optionally extended for short stochastic textures) -> -20 LUFS with at most 6 dB of
look-ahead limiting, true peak <= -1 dBTP -> AAC-LC 160 kbps 48 kHz -> verify.

Usage:
  python master.py                      # every sound in manifest.json whose original is present
  python master.py rain_puddle drip     # only these
  python master.py --loop-mode cap3     # override config.json loop_mode for this run
  python master.py --list               # show which originals are present / missing
"""
import argparse, glob, json, os, re, subprocess, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
CFG = json.load(open(os.path.join(HERE, 'config.json')))
SR = CFG['sample_rate']


def ff(args, inp=None):
    return subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-v', 'error'] + args, input=inp, capture_output=True, check=True).stdout


def decode(path, af=None):
    """Any lossless file -> float32 stereo at SR. Mono is duplicated, >2 channels downmixed."""
    ch = int(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=channels', '-of', 'csv=p=0', path], capture_output=True, text=True).stdout.strip() or 2)
    chain = []
    if ch > 2:
        chain.append('pan=stereo|FL<FL+0.7*FC+0.5*BL+0.5*SL|FR<FR+0.7*FC+0.5*BR+0.5*SR')
    chain.append('aresample=%d:resampler=soxr:precision=28' % SR)
    if af:
        chain.append(af)
    raw = ff(['-i', path, '-af', ','.join(chain), '-ac', '2', '-f', 'f32le', '-'])
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()


def filt(x, af):
    if not af:
        return x
    raw = ff(['-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af', af, '-f', 'f32le', '-'], x.astype(np.float32).tobytes())
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()


def ebur(x, tiles=3):
    t = np.tile(x, (tiles, 1)).astype(np.float32)
    p = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af', 'ebur128=peak=true', '-f', 'null', '-'], input=t.tobytes(), capture_output=True).stderr.decode()
    s = p[p.rfind('Summary'):]
    I = float(re.search(r'I:\s+(-?[\d.]+) LUFS', s).group(1))
    LRA = float(re.search(r'LRA:\s+(-?[\d.]+) LU', s).group(1))
    TP = float(re.search(r'Peak:\s+(-?[\d.inf]+) dBFS', s).group(1))
    return I, LRA, TP


def rms_db(x, win):
    n = len(x) // win
    r = np.sqrt((x[: n * win] ** 2).reshape(n, win, 2).mean(axis=(1, 2)))
    return 20 * np.log10(r + 1e-9)


def pick_window(x, n_needed):
    """Start of the steadiest window (lowest 1 s loudness variance, no near-clips)."""
    if len(x) <= n_needed:
        return 0
    rd = rms_db(x, SR)
    w = int(np.ceil(n_needed / SR))
    clip = np.abs(x).max(axis=1) > 0.99
    best = None
    for s in range(0, max(1, len(rd) - w + 1)):
        a = s * SR
        if a + n_needed > len(x):
            break
        sc = rd[s:s + w].std() + 100 * clip[a:a + n_needed].sum()
        if best is None or sc < best[0]:
            best = (sc, a)
    return best[1] if best else 0


def eqp(k):
    t = np.arange(k) / k
    return np.sin(t * np.pi / 2)[:, None], np.cos(t * np.pi / 2)[:, None]


def make_loop(seg, n, k):
    """seg has n+k samples; the k-sample tail is equal-power crossfaded into the head."""
    fin, fout = eqp(k)
    out = seg[:n].copy()
    out[:k] = seg[:k] * fin + seg[n:n + k] * fout
    return out


def extend_texture(x, n_total, k, seed):
    """Build a longer non-periodic texture from a short stochastic recording (rain, drips):
    random segments of 8 to 20 s joined with k-sample equal-power crossfades, chosen so no
    segment directly repeats its neighbour. L and R use different segment orders, which
    also widens mono sources. Used only where a sound is flagged extend=true."""
    rng = np.random.default_rng(seed)
    fin, fout = eqp(k)

    def one(ch):
        out = np.zeros(0, np.float32)
        last = -10 * SR
        while len(out) < n_total + k:
            L = int(rng.uniform(8, 20) * SR)
            L = min(L, len(x) - k - 1)
            for _ in range(20):
                a = int(rng.integers(0, len(x) - L - k))
                if abs(a - last) > L:
                    break
            last = a
            seg = x[a:a + L + k, ch].astype(np.float32)
            if len(out) == 0:
                out = seg
            else:
                head = out[-k:] * fout[:, 0] + seg[:k] * fin[:, 0]
                out = np.concatenate([out[:-k], head, seg[k:]])
        return out[: n_total + k]

    return np.stack([one(0), one(1)], axis=1)


def limit(y, db):
    if db <= 0.3:
        return y
    n = len(y)
    t = np.tile(y, (3, 1)).astype(np.float32)
    lim = 10 ** (CFG['true_peak_max_dbtp'] / 20) * 0.94
    raw = ff(['-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af', 'alimiter=limit=%.4f:attack=5:release=80:level=0' % lim, '-f', 'f32le', '-'], t.tobytes())
    z = np.frombuffer(raw, np.float32).reshape(-1, 2)
    return z[n:2 * n].copy()


def seam_ratio(x):
    """10 ms mean |diff| at the loop join / median elsewhere. ~1 = no click; >=5 = click."""
    d = np.abs(np.diff(np.concatenate([x[-SR // 100:], x[: SR // 100]]), axis=0)).mean()
    w = SR // 100
    body = np.abs(np.diff(x, axis=0))
    m = np.median([body[i:i + w].mean() for i in range(0, len(body) - w, w * 7)])
    return float(d / (m + 1e-12))


def encode(y, fn):
    ff(['-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'aac', '-b:a', CFG['aac_bitrate'], '-ar', str(SR), '-movflags', '+faststart', fn], y.astype(np.float32).tobytes())


def loop_seconds(spec, loop_mode):
    L = float(spec['loop_s'])
    if loop_mode == 'cap3' and spec.get('kind', 'recorded') == 'recorded':
        L = min(L, float(CFG['cap_seconds']))
    return L


def find_original(spec, use_backup=False):
    sid = spec.get('backup_id') if use_backup else spec['freesound_id']
    if not sid or sid == 'TBD':
        return None
    hits = sorted(glob.glob(os.path.join(CFG['originals_dir'], '%s__*' % sid)))
    return hits[0] if hits else None


def master(name, spec, loop_mode, use_backup=False):
    src = find_original(spec, use_backup)
    if not src:
        return dict(name=name, status='MISSING_ORIGINAL', freesound_id=spec['freesound_id'])
    x = decode(src, 'highpass=f=20:poles=2')
    src_s = len(x) / SR
    x = filt(x, spec.get('af'))
    L = loop_seconds(spec, loop_mode)
    k = int(CFG['crossfade_s'] * SR)
    n = int(L * SR)
    extended = False
    if len(x) < n + k + SR:
        if not spec.get('extend'):
            L = round((len(x) - k - SR) / SR, 2)
            n = int(L * SR)
            seg = x[pick_window(x, n + k):][: n + k]
        else:
            extended = True
            seg = extend_texture(x, n, k, seed=int(spec['freesound_id']))
    else:
        a = pick_window(x, n + k)
        seg = x[a:a + n + k]
    lp = make_loop(seg, n, k)
    I, LRA, TP = ebur(lp)
    g = CFG['target_lufs'] - I
    lim = 0.0
    if TP + g > CFG['true_peak_max_dbtp'] - 0.2:
        need = TP + g - (CFG['true_peak_max_dbtp'] - 0.2)
        lim = min(CFG['max_limit_db'], need)
        g = min(g, CFG['true_peak_max_dbtp'] - 0.2 - TP + lim)
    y = limit(lp * 10 ** (g / 20), lim)
    os.makedirs(os.path.join(HERE, CFG['out_dir']), exist_ok=True)
    fn = os.path.join(HERE, CFG['out_dir'], spec['file'])
    for _ in range(6):
        encode(y, fn)
        d = decode(fn)
        I2, LRA2, TP2 = ebur(d)
        if TP2 <= CFG['true_peak_max_dbtp']:
            break
        y = y * 10 ** ((CFG['true_peak_max_dbtp'] - 0.3 - TP2) / 20)
    d = decode(fn)
    I2, LRA2, TP2 = ebur(d)
    res = dict(
        name=name, status='OK', file=spec['file'], freesound_id=spec['freesound_id'], original=os.path.basename(src),
        original_s=round(src_s, 2), loop_mode=loop_mode, loop_s=round(len(d) / SR, 2), extended_texture=extended,
        eq=spec.get('af', ''), gain_db=round(g, 1), limit_db=round(lim, 1), pre_I=I, pre_TP=TP,
        lufs=I2, lra=LRA2, true_peak=TP2, seam=round(seam_ratio(d), 2), steadiness_3s_sd=round(float(rms_db(d, 3 * SR).std()), 2),
        bytes=os.path.getsize(fn),
        pass_lufs=abs(I2 - CFG['target_lufs']) <= 0.5, pass_tp=TP2 <= CFG['true_peak_max_dbtp'], pass_limit=lim <= CFG['max_limit_db'],
        pass_len=(len(d) / SR) >= (179 if loop_mode == 'full' and spec.get('kind', 'recorded') == 'recorded' else 0),
    )
    res['pass_seam'] = res['seam'] < 3
    return res


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('names', nargs='*')
    ap.add_argument('--loop-mode', choices=['full', 'cap3'], default=CFG['loop_mode'])
    ap.add_argument('--list', action='store_true')
    ap.add_argument('--backup', action='store_true', help='use each sound\'s backup_id original instead of the first choice')
    a = ap.parse_args()
    man = json.load(open(os.path.join(HERE, 'manifest.json')))['recorded']
    if a.list:
        for name, spec in man.items():
            print('%-16s %-8s %s' % (name, spec['freesound_id'], find_original(spec) or 'MISSING'))
        return
    names = a.names or list(man)
    out = {}
    for name in names:
        r = master(name, man[name], a.loop_mode, a.backup)
        out[name] = r
        print(json.dumps(r), flush=True)
    os.makedirs(CFG['report_dir'], exist_ok=True)
    rp = os.path.join(CFG['report_dir'], 'master-results.json')
    prev = json.load(open(rp)) if os.path.exists(rp) else {}
    prev.update(out)
    json.dump(prev, open(rp, 'w'), indent=1)


if __name__ == '__main__':
    main()
