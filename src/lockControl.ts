// Pure lock-screen remote-command logic. No native imports, so it can be unit tested.
//
// The lock screen / Control Center is bound to one silent looping "control" player,
// never to a real sound. A remote pause or play therefore only changes that silent
// player natively; the mixer sees the change here and fades every real sound together.

export interface ControlStatus {
  isLoaded: boolean;
  playing: boolean;
  isBuffering?: boolean;
  didJustFinish?: boolean;
}

export type RemoteAction = 'play' | 'pause' | null;

export class RemoteCommandTracker {
  private wasPlaying = false;

  /** Call when the mixer itself starts or stops the control player. */
  sync(playing: boolean) {
    this.wasPlaying = playing;
  }

  /**
   * Map a control-player status update to a mix action.
   * @param internal true while the mixer itself is changing play state (ignore echoes)
   * @param mixPlaying whether the mix is currently playing
   */
  onStatus(s: ControlStatus, internal: boolean, mixPlaying: boolean): RemoteAction {
    if (internal || !s.isLoaded) return null;
    if (s.playing) {
      this.wasPlaying = true;
      return mixPlaying ? null : 'play';
    }
    if (this.wasPlaying && !s.isBuffering && !s.didJustFinish) {
      this.wasPlaying = false;
      if (mixPlaying) return 'pause';
    }
    return null;
  }
}

/** Lock screen title for the current mix, optionally with the sleep timer remaining. */
export function mixTitle(names: string[], timerLeftSec?: number | null): string {
  const base = names.length === 0 ? 'Lulla' : names.length <= 2 ? names.join(' + ') : `${names[0]} + ${names.length - 1} more`;
  if (timerLeftSec == null || timerLeftSec <= 0) return base;
  const m = Math.ceil(timerLeftSec / 60);
  return `${base} (${m} min left)`;
}
