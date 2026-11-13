import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { Asset } from 'expo-asset';
import { SOUND_BY_ID } from './catalog';
import { CROSSFADE_MS, DEFAULT_VOLUME, FADE_IN_MS, FADE_OUT_MS, clamp01, rampGain } from './fade';
import { RemoteCommandTracker, mixTitle } from './lockControl';

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
 * - The lock screen (Now Playing + remote play/pause/toggle) is bound to a silent looping
 *   control player, never to a real sound. A remote pause only stops that silent player
 *   natively; the mixer then fades every real sound out together, and a remote play fades
 *   them all back in. Remote play goes through the same trial gate as the in-app button.
 */
class Mixer {
  private tracks = new Map<string, Track>();
  private volumes = new Map<string, number>();
  private listeners = new Set<Listener>();
  private master = 1; // used for the sleep timer fade-out
  private pausedMaster = 1; // master level frozen while a pause fade-out runs
  private timer: ReturnType<typeof setInterval> | null = null;
  private control: AudioPlayer | null = null;
  private controlActive = false;
  private controlSub: { remove: () => void } | null = null;
  private remote = new RemoteCommandTracker();
  private remotePlayGuard: () => boolean = () => true;
  private timerLeftSec: number | null = null;
  private artworkUrl: string | undefined;
  private internalChange = 0; // >0 while the mixer itself is changing play state
  playing = false;

  /** Called before a lock-screen play is honoured; return false to refuse (e.g. trial used up). */
  setRemotePlayGuard(guard: () => boolean) {
    this.remotePlayGuard = guard;
  }

  /** Sleep timer remaining, shown in the lock screen title. Pass null when no timer runs. */
  setTimerLeft(sec: number | null) {
    const prevMin = this.timerLeftSec == null ? null : Math.ceil(this.timerLeftSec / 60);
    const nextMin = sec == null ? null : Math.ceil(sec / 60);
    this.timerLeftSec = sec;
    if (prevMin !== nextMin) this.updateLockScreen();
  }

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
      const control = createAudioPlayer(require('../assets/silence.m4a'));
      control.loop = true;
      control.volume = 1; // the file itself is digital silence
      this.control = control;
      this.controlSub = control.addListener('playbackStatusUpdate', (st) => {
        const action = this.remote.onStatus(st, this.internalChange > 0, this.playing);
        if (action === 'play') {
          if (this.volumes.size > 0 && this.remotePlayGuard()) this.play();
          else this.setControlPlaying(false); // refused: put the lock screen back to paused
        } else if (action === 'pause') {
          this.pause();
        }
      });
    } catch {
      /* lock screen control is best effort */
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
  /** Playback position (s) per active sound. Used by the QA overlay only. */
  positions(): Record<string, number> {
    const out: Record<string, number> = {};
    this.tracks.forEach((t, id) => {
      try {
        out[id] = t.player.currentTime;
      } catch {
        out[id] = -1;
      }
    });
    return out;
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

  // ---- lock screen / Now Playing (silent control player) ----

  private title(): string {
    const names = this.active().map((id) => SOUND_BY_ID[id]?.name).filter(Boolean) as string[];
    return mixTitle(names, this.timerLeftSec);
  }

  private setControlPlaying(on: boolean) {
    const c = this.control;
    if (!c) return;
    this.internalChange++;
    try {
      if (on) c.play();
      else c.pause();
    } catch {
      /* ignore */
    }
    this.internalChange--;
    this.remote.sync(on);
  }

  private detachLock() {
    if (!this.control || !this.controlActive) return;
    this.setControlPlaying(false);
    try {
      this.control.clearLockScreenControls();
    } catch {
      /* ignore */
    }
    this.controlActive = false;
  }

  private updateLockScreen() {
    if (!this.control) return;
    if (this.volumes.size === 0) {
      this.detachLock();
      return;
    }
    const metadata = { title: this.title(), artist: 'Lulla', albumTitle: 'Sleep Sounds', artworkUrl: this.artworkUrl };
    try {
      if (this.controlActive) {
        this.control.updateLockScreenMetadata(metadata);
      } else {
        this.control.setActiveForLockScreen(true, metadata, {
          isLiveStream: true,
          showSeekForward: false,
          showSeekBackward: false,
        });
        this.controlActive = true;
      }
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
    this.setControlPlaying(true);
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
    this.setControlPlaying(false);
    this.emit();
  }

  /** QA builds only: jump a playing sound to `before` seconds ahead of its loop point. */
  seekForQa(id: string, before: number) {
    const t = this.tracks.get(id);
    if (!t) return;
    try {
      const d = t.player.duration;
      if (d > before) t.player.seekTo(d - before);
    } catch {
      /* ignore */
    }
  }

  /** QA builds only: loop length of a loaded sound, in seconds. */
  durationForQa(id: string): number {
    try {
      return this.tracks.get(id)?.player.duration ?? 0;
    } catch {
      return 0;
    }
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
    this.detachLock();
    this.emit();
  }
}

export const mixer = new Mixer();
