import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { SOUND_BY_ID } from './catalog';

type Listener = () => void;

/** Multi-track looping mixer. Each active sound has its own player + volume. */
class Mixer {
  private players = new Map<string, AudioPlayer>();
  private volumes = new Map<string, number>();
  private listeners = new Set<Listener>();
  private master = 1; // used for fade-out
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
    return this.volumes.get(id) ?? 0.7;
  }

  private ensurePlayer(id: string) {
    let p = this.players.get(id);
    if (!p) {
      p = createAudioPlayer(SOUND_BY_ID[id].source);
      p.loop = true;
      this.players.set(id, p);
    }
    return p;
  }

  private applyVolume(id: string) {
    const p = this.players.get(id);
    if (p) p.volume = Math.max(0, Math.min(1, this.volume(id) * this.master));
  }

  toggle(id: string) {
    if (this.volumes.has(id)) {
      this.volumes.delete(id);
      const p = this.players.get(id);
      if (p) {
        p.pause();
        p.remove();
        this.players.delete(id);
      }
    } else {
      this.volumes.set(id, 0.7);
      const p = this.ensurePlayer(id);
      this.applyVolume(id);
      if (this.playing) p.play();
    }
    if (this.volumes.size === 0) this.playing = false;
    this.emit();
  }

  setVolume(id: string, v: number) {
    if (!this.volumes.has(id)) return;
    this.volumes.set(id, v);
    this.applyVolume(id);
    this.emit();
  }

  setMaster(m: number) {
    this.master = m;
    this.volumes.forEach((_, id) => this.applyVolume(id));
  }

  play() {
    if (this.volumes.size === 0) return;
    this.master = 1;
    this.volumes.forEach((_, id) => {
      this.applyVolume(id);
      this.ensurePlayer(id).play();
    });
    this.playing = true;
    this.emit();
  }

  pause() {
    this.players.forEach((p) => p.pause());
    this.playing = false;
    this.emit();
  }

  clear() {
    this.players.forEach((p) => {
      p.pause();
      p.remove();
    });
    this.players.clear();
    this.volumes.clear();
    this.playing = false;
    this.emit();
  }
}

export const mixer = new Mixer();
