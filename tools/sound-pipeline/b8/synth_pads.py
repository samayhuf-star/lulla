"""Build 8: three original synth-pad loops (Healing / Frequencies category).

Original work by Samay Vashsht. Pure additive synthesis with numpy: detuned partials,
slow amplitude LFOs and a slow LFO-swept low-pass applied per partial. No samples, no
recordings and no third-party audio are used or resynthesised.

Seamless by construction: every partial frequency and every LFO rate is a whole number of
cycles over the loop length T, and phases are computed with exact integer arithmetic, so
sample N equals sample 0. The low-pass is applied per partial (a gain on each sine), so
there is no filter state to wrap.

Run:  python3 synth_pads.py            (writes WAV originals, m4a masters, a JSON report)
"""
import json, os, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import master as M  # noqa: E402  (ffmpeg helpers: ebur, limit, encode, seam_ratio)

SR = M.SR
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
ORIG = M.CFG['originals_dir']
REPORT = os.path.join(M.CFG['report_dir'], 'synth-pads.json')
BANDS = [(20, 100), (100, 300), (300, 800), (800, SR / 2)]
REF = '/workspace/lulla-ref/clip.wav'  # measured for the spectrum only, never read into audio

# Tonal centres (Hz): D2 73.4, G2 98, D3 146.8, Eb3 155.6, G3 196, D4 293.7, Eb4 311.1,
# F4 349.2, G4 392, A4 440, Bb4 466.2
PAD_WARM = [(73.4, 0.9), (98.0, 1.0), (146.8, 0.9), (155.6, 0.35), (196.0, 0.9), (293.7, 0.5), (311.1, 0.25),
            (349.2, 0.3), (392.0, 0.4), (466.2, 0.2)]
TRACKS = {
    'freq_432': dict(
        title='432 Hz Deep Sleep', T=300, seed=11, cutoff=600, sweep=0.25, centres=PAD_WARM,
        harm=[1.0, 0.25, 0.08], target=[0.22, 0.49, 0.29], sines=[(432.0, 1.0)], sine_share=0.5),
    'freq_528': dict(
        title='528 Hz Calm', T=300, seed=23, cutoff=650, sweep=0.2, centres=PAD_WARM,
        harm=[1.0, 0.25, 0.08], target=[0.22, 0.49, 0.29], sines=[(528.0, 1.0)], sine_share=0.45),
    'freq_963': dict(
        # 963 Hz itself sits very quietly (about 0.1% of the energy); its octave down,
        # 481.5 Hz, carries the tone under the pad so it stays gentle.
        title='963 Hz Night', T=300, seed=37, cutoff=600, sweep=0.25, centres=PAD_WARM,
        harm=[1.0, 0.2, 0.05], target=[0.22, 0.49, 0.29], sines=[(481.5, 1.0), (963.0, 0.1)], sine_share=0.4),
    'freq_blend': dict(
        title='432+528 Blend', T=300, seed=41, cutoff=650, sweep=0.2,
        centres=[c for c in PAD_WARM if c[0] != 466.2],
        harm=[1.0, 0.25, 0.08], target=[0.22, 0.49, 0.29], sines=[(432.0, 1.0), (528.0, 0.8)], sine_share=0.55),
    'deep_drone': dict(
        title='Deep Drone', T=300, seed=53, cutoff=480, sweep=0.25,
        centres=[(49.0, 0.7), (73.4, 1.0), (98.0, 0.9), (146.8, 1.0), (155.6, 0.5), (196.0, 0.8),
                 (293.7, 0.45), (311.1, 0.3), (392.0, 0.25), (466.2, 0.15)],
        harm=[1.0, 0.30, 0.10], target=[0.26, 0.51, 0.23]),
}
BITRATE = '96k'  # tonal pads under 1 kHz; keeps the bundle growth small
SYN_SR = 4000  # synthesis rate (content is all under 1 kHz); upsampled exactly by FFT zero-padding


def phase(k, N):
    """Exact phase of a k-cycles-per-loop oscillator (int64 arithmetic, perfectly periodic)."""
    n = np.arange(N, dtype=np.int64)
    return 2 * np.pi * ((k * n) % N) / N


def lfo(rng, T, N, lo_s, hi_s, depth):
    """Slow sine LFO with a whole number of cycles over T, period between lo_s and hi_s."""
    k = max(1, int(round(T / rng.uniform(lo_s, hi_s))))
    return 1 - depth + depth * 0.5 * (1 + np.sin(phase(k, N) + rng.uniform(0, 2 * np.pi)))


def band_of(f):
    for i, (a, b) in enumerate(BANDS):
        if a <= f < b:
            return i
    return None


def synth(spec):
    T = spec['T']
    N = T * SYN_SR
    rng = np.random.default_rng(spec['seed'])
    # Slow low-pass sweep shared by all partials: cutoff(t) = cutoff * (1 + sweep * sin)
    ks = max(1, int(round(T / 47)))
    cut = spec['cutoff'] * (1 + spec['sweep'] * np.sin(phase(ks, N)))
    groups = np.zeros((3, N, 2), np.float32)  # energy groups by band, scaled at the end
    sines = np.zeros((N, 2), np.float32)
    for f0, amp in spec['centres']:
        for h, ha in enumerate(spec['harm'], start=1):
            f = f0 * h
            if f > 900:
                continue
            for v in range(3):  # three detuned voices per partial and channel
                for ch in range(2):
                    det = rng.uniform(0.08, 0.35) * (v - 1) + rng.uniform(-0.05, 0.05)
                    k = int(round((f + det) * T))
                    b = band_of(k / T)
                    if b is None or b > 2:
                        continue
                    am = lfo(rng, T, N, 14, 55, rng.uniform(0.25, 0.5))
                    lp = 1 / np.sqrt(1 + (k / T / cut) ** 4)  # 2nd-order-like low-pass gain
                    groups[b, :, ch] += (amp * ha * am * lp * np.sin(phase(k, N) + rng.uniform(0, 2 * np.pi))).astype(np.float32)
    for f, amp in spec.get('sines', []):
        k = int(round(f * T))
        sw = lfo(rng, T, N, 30, 60, 0.2)
        for ch in range(2):
            sines[:, ch] += (amp * sw * np.sin(phase(k, N) + ch * 0.6)).astype(np.float32)
    # Scale each band group to the target energy share.
    tgt = np.array(spec['target'], float)
    e = np.array([np.mean(g.astype(np.float64) ** 2) for g in groups])
    if spec.get('sines'):
        es = np.mean(sines.astype(np.float64) ** 2)
        share = spec['sine_share']
        pad_hi = (1 - share) * tgt[2]
        sines *= np.sqrt(share * tgt[2] / es)
        tgt = tgt.copy(); tgt[2] = pad_hi
    for b in range(3):
        groups[b] *= np.sqrt(tgt[b] / e[b])
    y = groups.sum(axis=0) + sines
    # Global slow swell, then -22 dBFS RMS before mastering.
    y *= lfo(rng, T, N, 60, 100, 0.15)[:, None].astype(np.float32)
    y = upsample(y, SR // SYN_SR)
    y *= 10 ** (-22 / 20) / np.sqrt(np.mean(y.astype(np.float64) ** 2))
    return y.astype(np.float32)


def upsample(x, r):
    """Exact periodic upsampling: zero-pad the spectrum. Keeps the loop sample-perfect."""
    n = len(x)
    X = np.fft.rfft(x.astype(np.float64), axis=0)
    Y = np.zeros((n * r // 2 + 1, x.shape[1]), complex)
    Y[: X.shape[0]] = X
    return (np.fft.irfft(Y, n * r, axis=0) * r).astype(np.float32)


def band_split(x, sr):
    """Share of energy per band, summed over channels (a mono downmix would hide the
    decorrelated L/R pad voices and overweight the centred tones)."""
    x = x[:, None] if x.ndim == 1 else x
    P = (np.abs(np.fft.rfft(x.astype(np.float64), axis=0)) ** 2).sum(axis=1)
    fr = np.fft.rfftfreq(len(x), 1 / sr)
    tot = P[(fr >= 20)].sum()
    return [round(float(P[(fr >= a) & (fr < b)].sum() / tot), 4) for a, b in BANDS]


def write_wav(path, y):
    M.ff(['-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s24le', path], y.astype(np.float32).tobytes())


def master(y):
    I, _, TP = M.ebur(y)
    g = M.CFG['target_lufs'] - I
    z = y * 10 ** (g / 20)
    I2, LRA, TP2 = M.ebur(z)
    lim = 0.0
    if TP2 > M.CFG['true_peak_max_dbtp']:
        lim = TP2 - M.CFG['true_peak_max_dbtp'] + 0.3
        assert lim <= M.CFG['max_limit_db'], f'needs {lim:.1f} dB limiting'
        z = M.limit(z, lim)
        I2, LRA, TP2 = M.ebur(z)
    return z, dict(pre_rms_dbfs=-22.0, pre_lufs=round(I, 2), gain_db=round(g, 2), limit_db=round(lim, 2),
                   lufs=round(I2, 2), lra=round(LRA, 2), true_peak_dbtp=round(TP2, 2))


def main():
    os.makedirs(ORIG, exist_ok=True)
    rep = {}
    if os.path.exists(REF):  # spectrum comparison only
        ref = M.decode(REF)
        rep['_reference_split_20_100_300_800_up'] = band_split(ref, SR)
    for sid, spec in TRACKS.items():
        y = synth(spec)
        wav = os.path.join(ORIG, f'{sid}_original.wav')
        write_wav(wav, y)
        z, r = master(y)
        out = os.path.join(ROOT, 'assets', 'sounds', f'{sid}.m4a')
        M.ff(['-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'aac', '-b:a', BITRATE, '-ar', str(SR),
              '-movflags', '+faststart', out], z.astype(np.float32).tobytes())
        dec = M.decode(out)
        Id, _, TPd = M.ebur(dec[: len(z)])
        r.update(title=spec['title'], duration_s=spec['T'], wav=wav, m4a=os.path.relpath(out, ROOT),
                 m4a_bytes=os.path.getsize(out), split_master=band_split(z, SR), split_target=spec['target'],
                 split_m4a=band_split(dec, SR), seam_ratio_master=round(M.seam_ratio(z), 3),
                 seam_ratio_m4a=round(M.seam_ratio(dec[: len(z)]), 3), m4a_lufs=round(Id, 2), m4a_tp_dbtp=round(TPd, 2),
                 sample0_vs_end_abs=float(np.abs(z[0] - z[-1]).max()))
        rep[sid] = r
        print(sid, json.dumps(r), flush=True)
    json.dump(rep, open(REPORT, 'w'), indent=1)
    print('report', REPORT)


if __name__ == '__main__':
    main()
