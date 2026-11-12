import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { Asset } from 'expo-asset';
import { SOUND_BY_ID } from './catalog';
import { CROSSFADE_MS, DEFAULT_VOLUME, FADE_IN_MS, FADE_OUT_MS, clamp01, rampGain } from './fade';

type Listener = () => void;

interface Track {
  player: AudioPlayer;
  gain: number; // fade gain 0..1, multiplied with user volume and master
  ramp?: { from: number; to: number; start: number; dur: number; done?: () => void };
}

const TICK_MS = 30;

/**
 * Multi-track looping mixer.
 * - Every sound file has its loop seam baked in, and expo-audio loops through a queue player,
 *   so there is no gap at the loop point.
 * - Starting, stopping, adding and removing sounds always ramp with an equal-power curve,
 *   so nothing ever starts or stops at full level (no pops).
 * - One player is registered with the lock screen (Now Playing + remote play/pause/toggle).
 *   When the lock screen pauses or plays it, the whole mix follows.
 */
class Mixer {
  private tracks = new Map<string, Track>();
  private volumes = new Map<string, number>();
  private listeners = new Set<Listener>();
  private master = 1; // used for the sleep timer fade-out
  private pausedMaster = 1; // master level frozen while a pause fade-out runs
  private lockWasPlaying = false;
  private timer: ReturnType<typeof setInterval> | null = null;
  private lockId: string | null = null;
  private lockSub: { remove: () => void } | null = null;
  private artworkUrl: string | undefined;
  private internalChange = 0; // >0 while the mixer itself is changing play state
  playing = false;

  async init() {
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionMode: 'doNotMix',
      });
    } catch {
      /* ignore */
    }
    try {
      const icon = Asset.fromModule(require('../assets/icon-v2.png'));
      await icon.downloadAsync();
      this.artworkUrl = icon.localUri ?? icon.uri ?? undefined;
    } catch {
      /* artwork is optional */
    }
  }

  subscribe(l: Listener) {
    this.listeners.add(l);
    return () => {
      this.listeners.delete(l);
    };
  }
  private emit() {
    this.listeners.forEach((l) => l());
  }

  active(): string[] {
    return Array.from(this.volumes.keys());
  }
  has(id: string) {
    return this.volumes.has(id);
  }
  volume(id: string) {
    return this.volumes.get(id) ?? DEFAULT_VOLUME;
  }

  // ---- low level ----

  private ensureTrack(id: string): Track {
    let t = this.tracks.get(id);
    if (!t) {
      const player = createAudioPlayer(SOUND_BY_ID[id].source);
      player.loop = true;
      player.volume = 0;
      t = { player, gain: 0 };
      this.tracks.set(id, t);
    }
    return t;
  }

  private apply(id: string) {
    const t = this.tracks.get(id);
    if (!t) return;
    try {
      t.player.volume = clamp01(this.volume(id) * (this.playing ? this.master : this.pausedMaster) * t.gain);
    } catch {
      /* player released */
    }
  }

  private rampTo(id: string, to: number, dur: number, done?: () => void) {
    const t = this.tracks.get(id);
    if (!t) return;
    // A new ramp replaces any running one; the old completion callback no longer applies.
    t.ramp = { from: t.gain, to, start: Date.now(), dur, done };
    this.startTicker();
  }

  private startTicker() {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick(), TICK_MS);
  }

  private tick() {
    const now = Date.now();
    let busy = false;
    this.tracks.forEach((t, id) => {
      const r = t.ramp;
      if (!r) return;
      const el = now - r.start;
      t.gain = rampGain(r.from, r.to, el, r.dur);
      this.apply(id);
      if (el >= r.dur) {
        t.gain = r.to;
        t.ramp = undefined;
        r.done?.();
      } else busy = true;
    });
    if (!busy && this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private release(id: string) {
    const t = this.tracks.get(id);
    if (!t) return;
    this.tracks.delete(id);
    this.internalChange++;
    try {
      t.player.pause();
      if (this.lockId === id) this.detachLock();
      t.player.remove();
    } catch {
      /* ignore */
    }
    this.internalChange--;
    this.updateLockScreen();
  }

  private playTrack(t: Track) {
    this.internalChange++;
    try {
      t.player.play();
    } catch {
      /* ignore */
    }
    this.internalChange--;
  }

  private pauseTrack(t: Track) {
    this.internalChange++;
    try {
      t.player.pause();
    } catch {
      /* ignore */
    }
    this.internalChange--;
  }

  // ---- lock screen / Now Playing ----

  private title(): string {
    const names = this.active().map((id) => SOUND_BY_ID[id]?.name).filter(Boolean);
    if (names.length <= 2) return names.join(' + ');
    return `${names[0]} + ${names.length - 1} more`;
  }

  private detachLock() {
    this.lockSub?.remove();
    this.lockSub = null;
    const t = this.lockId ? this.tracks.get(this.lockId) : undefined;
    try {
      t?.player.clearLockScreenControls();
    } catch {
      /* ignore */
    }
    this.lockId = null;
  }

  private updateLockScreen() {
    const ids = this.active().filter((id) => this.tracks.has(id));
    if (ids.length === 0) {
      this.detachLock();
      return;
    }
    const metadata = { title: this.title() || 'Lulla', artist: 'Lulla', albumTitle: 'Sleep Sounds', artworkUrl: this.artworkUrl };
    try {
      if (this.lockId && this.tracks.has(this.lockId) && ids.includes(this.lockId)) {
        this.tracks.get(this.lockId)!.player.updateLockScreenMetadata(metadata);
        return;
      }
      this.detachLock();
      const id = ids[0];
      const t = this.tracks.get(id)!;
      t.player.setActiveForLockScreen(true, metadata, {
        isLiveStream: true,
        showSeekForward: false,
        showSeekBackward: false,
      });
      this.lockId = id;
      // Remote play / pause / toggle act on this player natively; mirror them on the whole mix.
      this.lockWasPlaying = false;
      this.lockSub = t.player.addListener('playbackStatusUpdate', (s) => {
        if (this.internalChange > 0 || !s.isLoaded) return;
        if (s.playing) {
          this.lockWasPlaying = true;
          if (!this.playing) this.play(); // remote play from lock screen / Control Center
        } else if (this.lockWasPlaying && !s.isBuffering && !s.didJustFinish) {
          this.lockWasPlaying = false;
          if (this.playing) this.pause(); // remote pause from lock screen / Control Center
        }
      });
    } catch {
      /* lock screen is best effort */
    }
  }

  // ---- public API (unchanged signatures) ----

  toggle(id: string) {
    if (this.volumes.has(id)) {
      this.volumes.delete(id);
      if (this.playing) this.rampTo(id, 0, CROSSFADE_MS, () => this.release(id));
      else this.release(id);
    } else {
      this.volumes.set(id, DEFAULT_VOLUME);
      const existed = this.tracks.has(id); // may still be fading out after a quick re-tap
      const t = this.ensureTrack(id);
      if (this.playing) {
        if (!existed) {
          t.gain = 0;
          this.apply(id);
          this.playTrack(t);
        }
        this.rampTo(id, 1, CROSSFADE_MS);
      }
    }
    if (this.volumes.size === 0) this.playing = false;
    this.updateLockScreen();
    this.emit();
  }

  setVolume(id: string, v: number) {
    if (!this.volumes.has(id)) return;
    this.volumes.set(id, clamp01(v));
    this.apply(id);
    this.emit();
  }

  setMaster(m: number) {
    this.master = clamp01(m);
    this.volumes.forEach((_, id) => this.apply(id));
  }

  play() {
    if (this.volumes.size === 0) return;
    this.master = 1;
    this.playing = true;
    this.volumes.forEach((_, id) => {
      const t = this.ensureTrack(id);
      if (!t.ramp) t.gain = Math.min(t.gain, 0.0001);
      this.apply(id);
      this.playTrack(t);
      this.rampTo(id, 1, FADE_IN_MS);
    });
    this.updateLockScreen();
    this.emit();
  }

  pause() {
    if (this.playing) this.pausedMaster = this.master;
    this.playing = false;
    this.tracks.forEach((t, id) => {
      this.rampTo(id, 0, FADE_OUT_MS, () => {
        if (!this.playing) this.pauseTrack(t);
      });
    });
    this.emit();
  }

  clear() {
    const ids = Array.from(this.tracks.keys());
    this.volumes.clear();
    const wasPlaying = this.playing;
    if (wasPlaying) this.pausedMaster = this.master;
    this.playing = false;
    ids.forEach((id) => {
      if (wasPlaying) this.rampTo(id, 0, FADE_OUT_MS, () => this.release(id));
      else this.release(id);
    });
    this.emit();
  }
}

export const mixer = new Mixer();
