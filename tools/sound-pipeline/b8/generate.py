#!/usr/bin/env python3
"""Build 8 generated sounds: noises, Om drone, delta binaural, and FluidR3 lullaby renders.
Loop lengths are fixed (not affected by loop_mode). Output is mastered with master.py's
loudness, limiter, loop and encode steps so every file meets the same standard.

  python generate.py                 # all
  python generate.py brown_noise twinkle_piano
Needs: FLUIDSYNTH (path to fluidsynth binary) and SF2 (path to FluidR3_GM.sf2) env vars
for the lullabies; defaults are the box paths.
"""
import os, sys, json, subprocess, tempfile
import numpy as np
import mido
import master as M

SR = M.SR
FLUIDSYNTH = os.environ.get('FLUIDSYNTH', '/workspace/lulla-b8-tools/fluidsynth')
SF2 = os.environ.get('SF2', '/workspace/lulla-b8-tools/fsroot/usr/share/sounds/sf2/FluidR3_GM.sf2')
OUT = os.path.join(M.HERE, M.CFG['out_dir'])
XF = int(M.CFG['crossfade_s'] * SR)


def white(n, rng):
    return rng.standard_normal((n, 2)).astype(np.float32)


def colored(n, rng, slope):
    """Noise with power ~ 1/f^slope, independent L/R (slope 1 pink, 2 brown)."""
    out = np.zeros((n, 2), np.float32)
    f = np.fft.rfftfreq(n, 1 / SR)
    shape = np.ones_like(f)
    shape[1:] = 1 / f[1:] ** (slope / 2)
    shape[0] = 0
    shape[f < 20] = 0
    for ch in range(2):
        X = np.fft.rfft(rng.standard_normal(n)) * shape
        out[:, ch] = np.fft.irfft(X, n)
    return out / np.abs(out).max()


def fx(x, af):
    return M.filt(x.astype(np.float32), af)


def periodic(x):
    """Noise made with a circular FFT is already seamless; generic sounds use an equal-power seam."""
    return x


def finish(name, x, loop_s, already_seamless=False, af=None, note=''):
    n = int(loop_s * SR)
    if af:
        x = fx(x, af)
    lp = x[:n] if already_seamless else M.make_loop(x[: n + XF], n, XF)
    I, LRA, TP = M.ebur(lp)
    g = M.CFG['target_lufs'] - I
    lim = 0.0
    tpm = M.CFG['true_peak_max_dbtp'] - 0.2
    if TP + g > tpm:
        lim = min(M.CFG['max_limit_db'], TP + g - tpm)
        g = min(g, tpm - TP + lim)
    y = M.limit(lp * 10 ** (g / 20), lim)
    os.makedirs(OUT, exist_ok=True)
    fn = os.path.join(OUT, name + '.m4a')
    for _ in range(6):
        M.encode(y, fn)
        d = M.decode(fn)
        I2, LRA2, TP2 = M.ebur(d)
        if TP2 <= M.CFG['true_peak_max_dbtp']:
            break
        y = y * 10 ** ((M.CFG['true_peak_max_dbtp'] - 0.3 - TP2) / 20)
    r = dict(name=name, status='OK', kind='generated', file=name + '.m4a', loop_s=round(len(d) / SR, 2), lufs=I2, lra=LRA2, true_peak=TP2,
             limit_db=round(lim, 1), seam=round(M.seam_ratio(d), 2), bytes=os.path.getsize(fn), note=note)
    print(json.dumps(r), flush=True)
    return r


# ---------- lullabies (MIDI written in-house, public-domain melodies) ----------
# Notes as (midi_note or None for rest, beats). C major unless noted.
N = dict(C3=48, D3=50, E3=52, F3=53, G3=55, A3=57, B3=59, C4=60, D4=62, E4=64, F4=65, G4=67, A4=69, B4=71, C5=72, D5=74, E5=76, F5=77, G5=79)

TWINKLE = [  # trad. "Ah! vous dirai-je, maman" (PD)
    ('C4', 1), ('C4', 1), ('G4', 1), ('G4', 1), ('A4', 1), ('A4', 1), ('G4', 2),
    ('F4', 1), ('F4', 1), ('E4', 1), ('E4', 1), ('D4', 1), ('D4', 1), ('C4', 2),
    ('G4', 1), ('G4', 1), ('F4', 1), ('F4', 1), ('E4', 1), ('E4', 1), ('D4', 2),
    ('G4', 1), ('G4', 1), ('F4', 1), ('F4', 1), ('E4', 1), ('E4', 1), ('D4', 2),
    ('C4', 1), ('C4', 1), ('G4', 1), ('G4', 1), ('A4', 1), ('A4', 1), ('G4', 2),
    ('F4', 1), ('F4', 1), ('E4', 1), ('E4', 1), ('D4', 1), ('D4', 1), ('C4', 2),
]
TWINKLE_CHORDS = [('C3', 4), ('F3', 2), ('C3', 2), ('F3', 2), ('C3', 2), ('G3', 2), ('C3', 2),
                  ('C3', 2), ('F3', 2), ('C3', 2), ('G3', 2), ('C3', 2), ('F3', 2), ('C3', 2), ('G3', 2),
                  ('C3', 4), ('F3', 2), ('C3', 2), ('F3', 2), ('C3', 2), ('G3', 2), ('C3', 2)]

BRAHMS = [  # Brahms, Wiegenlied Op. 49 No. 4 (1868, PD), 3/4, C major
    ('E4', .5), ('E4', .5), ('G4', 1.5), ('E4', .5), ('E4', 1), ('G4', 2), ('E4', .5), ('G4', .5),
    ('C5', 1), ('B4', 1.5), ('A4', .5), ('A4', 1), ('G4', 1), ('D4', .5), ('E4', .5),
    ('F4', 1), ('D4', 1), ('D4', .5), ('E4', .5), ('F4', 2), ('D4', .5), ('F4', .5),
    ('B4', .5), ('A4', .5), ('G4', 1), ('B4', 1), ('C5', 2), ('C4', .5), ('C4', .5),
    ('C5', 2), ('A4', .5), ('F4', .5), ('G4', 2), ('E4', .5), ('C4', .5),
    ('F4', 1), ('G4', 1), ('A4', 1), ('G4', 2), ('C4', .5), ('C4', .5),
    ('C5', 2), ('A4', .5), ('F4', .5), ('G4', 2), ('E4', .5), ('C4', .5),
    ('F4', 1), ('E4', .5), ('D4', .5), ('C4', 1), (None, 2),
]
BRAHMS_BASS = [('C3', 3), ('C3', 3), ('G3', 3), ('C3', 3), ('G3', 3), ('G3', 3), ('G3', 3), ('C3', 3),
               ('F3', 3), ('C3', 3), ('F3', 3), ('C3', 3), ('F3', 3), ('C3', 3), ('G3', 3), ('C3', 3)]


def write_midi(path, tracks, bpm):
    mid = mido.MidiFile(ticks_per_beat=480)
    tempo = mido.bpm2tempo(bpm)
    for prog, ch, notes, vel in tracks:
        t = mido.MidiTrack()
        mid.tracks.append(t)
        t.append(mido.MetaMessage('set_tempo', tempo=tempo, time=0))
        t.append(mido.Message('program_change', program=prog, channel=ch, time=0))
        t.append(mido.Message('control_change', control=91, value=70, channel=ch, time=0))  # reverb send
        pending = 0
        for name, beats in notes:
            ticks = int(beats * 480)
            if name is None:
                pending += ticks
                continue
            pitches = name if isinstance(name, list) else [name]
            for i, p in enumerate(pitches):
                t.append(mido.Message('note_on', note=N[p] if isinstance(p, str) else p, velocity=vel, channel=ch, time=pending if i == 0 else 0))
            pending = 0
            for i, p in enumerate(pitches):
                t.append(mido.Message('note_off', note=N[p] if isinstance(p, str) else p, velocity=0, channel=ch, time=int(ticks * 0.95) if i == 0 else 0))
            pending = int(ticks * 0.05)
    mid.save(path)


def render(midi_path, wav_path, gain=0.5):
    subprocess.run([FLUIDSYNTH, '-ni', '-q', '-g', str(gain), '-r', str(SR), '-o', 'synth.reverb.active=1', '-o', 'synth.reverb.room-size=0.6',
                    '-o', 'synth.reverb.level=0.6', '-F', wav_path, SF2, midi_path], check=True, capture_output=True)
    return M.decode(wav_path)


def repeat_render(tracks, bpm, reps, total_beats_one):
    """Repeat the melody `reps` times; returns audio whose length is an exact number of bars
    (render one extra cycle so the reverb tail is carried across the loop point)."""
    with tempfile.TemporaryDirectory() as d:
        full = [(p, ch, notes * (reps + 1), vel) for p, ch, notes, vel in tracks]
        write_midi(os.path.join(d, 'm.mid'), full, bpm)
        x = render(os.path.join(d, 'm.mid'), os.path.join(d, 'm.wav'))
    one = int(total_beats_one * 60 / bpm * SR)
    n = one * reps
    # bar-boundary loop: fold the (reps+1)th cycle's first bars (which carry the tail) onto the start
    body = x[:n].copy()
    tail = x[n:n + int(4 * SR)]
    body[:len(tail)] += tail * 0  # melody restarts at n; the decaying reverb of cycle reps sits in x[n:], already overlapping cycle reps+1
    # carry the reverb tail of the last cycle into the start: difference between rendered x[n:] and a clean restart is the tail
    k = min(len(tail), int(3 * SR))
    restart = x[:k]
    carried = x[n:n + k] - restart
    body[:k] += carried
    return body, n


def beats(seq):
    return sum(b for _, b in seq)


def gen_all(only):
    rng = np.random.default_rng(20261113)
    res = {}
    todo = only or ['brown_noise', 'pink_noise', 'green_noise', 'white_noise', 'om_drone', 'delta_waves', 'brahms_musicbox', 'twinkle_piano', 'ambient_pad']
    n90 = int(90 * SR)
    for name in todo:
        if name == 'brown_noise':
            res[name] = finish(name, colored(n90, rng, 2.0), 90, True, 'lowpass=f=6000:poles=2', 'Generated brown noise (1/f^2), independent L/R')
        elif name == 'pink_noise':
            res[name] = finish(name, colored(n90, rng, 1.0), 90, True, 'lowpass=f=14000:poles=2', 'Generated pink noise (1/f), independent L/R')
        elif name == 'green_noise':
            res[name] = finish(name, colored(n90, rng, 1.0), 90, True, 'highpass=f=200:poles=2,lowpass=f=1500:poles=2,equalizer=f=500:t=q:w=0.8:g=3',
                               'Generated pink noise band-passed 200 Hz to 1.5 kHz, centred near 500 Hz')
        elif name == 'white_noise':
            w = colored(n90, rng, 0.0)
            res[name] = finish(name, w, 90, True, 'highshelf=f=6000:g=-6:t=q:w=0.7,lowpass=f=16000:poles=2', 'Generated white noise, -6 dB shelf above 6 kHz')
        elif name == 'om_drone':
            L = 120
            t = np.arange(int((L + 5) * SR)) / SR
            f0 = 136.1
            # partial frequencies are whole cycles over the loop so the seam is clean; slow 0.1 Hz swell (12 cycles / 120 s)
            sig = np.zeros_like(t)
            for h, a in [(1, 1.0), (2, 0.45), (3, 0.25), (4, 0.12), (5, 0.06)]:
                f = round(f0 * h * L) / L
                sig += a * np.sin(2 * np.pi * f * t + h)
            sw = 0.75 + 0.25 * np.sin(2 * np.pi * (12 / L) * t)
            sub = 0.2 * np.sin(2 * np.pi * (round(f0 / 2 * L) / L) * t)
            x = np.stack([(sig * sw + sub), (sig * sw + sub) * 0.98], 1).astype(np.float32)
            x = x[: int(L * SR)]
            x = fx(np.tile(x, (2, 1)), 'aecho=0.8:0.6:60|90:0.25|0.18,lowpass=f=3000:poles=2')[int(L * SR):]
            res[name] = finish(name, x, L, True, None, 'Generated 136.1 Hz drone with soft harmonics, 0.1 Hz swell, light echo')
        elif name == 'delta_waves':
            L = 120  # 2 Hz beat: 240 whole beat cycles; carriers have whole cycles per loop
            t = np.arange(int(L * SR)) / SR
            l = np.sin(2 * np.pi * 200 * t)
            r = np.sin(2 * np.pi * 202 * t)
            pn = colored(len(t), rng, 1.0) * 10 ** (-18 / 20)
            x = (np.stack([l, r], 1) * 0.5 + pn).astype(np.float32)
            res[name] = finish(name, x, L, True, 'lowpass=f=8000:poles=2', 'Generated binaural beat: 200 Hz left, 202 Hz right (2 Hz delta), pink noise bed at -18 dB')
        elif name == 'twinkle_piano':
            bpm = 62
            body, n = repeat_render([(0, 0, TWINKLE, 52), (0, 1, TWINKLE_CHORDS, 34)], bpm, 3, beats(TWINKLE))
            res[name] = finish(name, body, n / SR, True, 'lowpass=f=7000:poles=2', 'FluidR3_GM Acoustic Grand Piano, trad. melody (PD), MIDI written in-house, 62 bpm')
        elif name == 'brahms_musicbox':
            bpm = 66
            body, n = repeat_render([(10, 0, BRAHMS, 50), (0, 1, BRAHMS_BASS, 28)], bpm, 3, beats(BRAHMS))
            res[name] = finish(name, body, n / SR, True, 'lowpass=f=8000:poles=2', 'FluidR3_GM Music Box (GM 11) + soft piano bass, Brahms Op. 49 No. 4 (PD), MIDI written in-house, 66 bpm')
        elif name == 'ambient_pad':
            bpm = 40
            prog = [(['C4', 'E4', 'G4'], 8), (['A3', 'C4', 'E4'], 8), (['F3', 'A3', 'C4'], 8), (['G3', 'B3', 'D4'], 8)]
            body, n = repeat_render([(89, 0, prog, 45), (95, 1, prog, 30)], bpm, 4, beats(prog))
            res[name] = finish(name, body, n / SR, True, 'lowpass=f=3500:poles=2', 'FluidR3_GM Pad 2 warm + Pad 8 sweep, own I-vi-IV-V progression, 40 bpm')
    rp = os.path.join(M.CFG['report_dir'], 'generate-results.json')
    os.makedirs(M.CFG['report_dir'], exist_ok=True)
    prev = json.load(open(rp)) if os.path.exists(rp) else {}
    prev.update(res)
    json.dump(prev, open(rp, 'w'), indent=1)


if __name__ == '__main__':
    gen_all(sys.argv[1:])
