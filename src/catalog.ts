// Build 8 catalog: 43 sounds. Masters still being produced are listed in
// assets/sounds/PENDING.json; `npm run check:sounds` must pass before any store build.
export type SoundId =
  'rain' | 'rain_roof' | 'rain_tent' | 'rain_window' | 'rain_umbrella' | 'rain_puddle' | 'thunder' | 'snow' | 'ocean' | 'lake' | 'creek' | 'waterfall' | 'underwater' | 'drip' | 'wind' | 'wind_leaves' | 'forest' | 'night' | 'cave' | 'grassland' | 'farm' | 'fire' | 'fan' | 'air_conditioner' | 'airplane' | 'heartbeat' | 'womb' | 'singing_bowls' | 'om_drone' | 'brahms_musicbox' | 'twinkle_piano' | 'schubert_piano' | 'ambient_pad' | 'delta_waves' | 'white_noise' | 'pink_noise' | 'green_noise' | 'brown_noise' | 'freq_432' | 'freq_528' | 'freq_963' | 'freq_blend' | 'deep_drone';

export type Category = 'Rain' | 'Water' | 'Nature' | 'Warmth' | 'Hum' | 'Calm' | 'Lullaby' | 'Binaural' | 'Noise' | 'Frequencies';

export interface Sound {
  id: SoundId;
  name: string;
  emoji: string;
  category: Category;
  /** Binaural beats only work on headphones; the tile and mix row show a badge. */
  headphones?: boolean;
  /** Short neutral description (read by VoiceOver). Never a health claim. */
  description?: string;
  source: number;
}

export const CATEGORIES: Category[] = ['Rain', 'Water', 'Nature', 'Warmth', 'Hum', 'Calm', 'Lullaby', 'Binaural', 'Noise', 'Frequencies'];

export const SOUNDS: Sound[] = [
  { id: 'rain', name: 'Rain', emoji: '🌧️', category: 'Rain', source: require('../assets/sounds/rain.m4a') },
  { id: 'rain_roof', name: 'Deep Rain on Roof', emoji: '🏠', category: 'Rain', source: require('../assets/sounds/rain_roof.m4a') },
  { id: 'rain_tent', name: 'Rain on Tent', emoji: '⛺', category: 'Rain', source: require('../assets/sounds/rain_tent.m4a') },
  { id: 'rain_window', name: 'Rain on Window', emoji: '🪟', category: 'Rain', source: require('../assets/sounds/rain_window.m4a') },
  { id: 'rain_umbrella', name: 'Rain on Umbrella', emoji: '☂️', category: 'Rain', source: require('../assets/sounds/rain_umbrella.m4a') },
  { id: 'rain_puddle', name: 'Rain on Puddle', emoji: '💧', category: 'Rain', source: require('../assets/sounds/rain_puddle.m4a') },
  { id: 'thunder', name: 'Distant Thunder', emoji: '⛈️', category: 'Rain', source: require('../assets/sounds/thunder.m4a') },
  { id: 'snow', name: 'Snow', emoji: '❄️', category: 'Rain', source: require('../assets/sounds/snow.m4a') },
  { id: 'ocean', name: 'Slow Ocean Waves', emoji: '🌊', category: 'Water', source: require('../assets/sounds/ocean.m4a') },
  { id: 'lake', name: 'Lake', emoji: '🏞️', category: 'Water', source: require('../assets/sounds/lake.m4a') },
  { id: 'creek', name: 'Creek', emoji: '🪨', category: 'Water', source: require('../assets/sounds/creek.m4a') },
  { id: 'waterfall', name: 'Waterfall', emoji: '⛲', category: 'Water', source: require('../assets/sounds/waterfall.m4a') },
  { id: 'underwater', name: 'Underwater', emoji: '🫧', category: 'Water', source: require('../assets/sounds/underwater.m4a') },
  { id: 'drip', name: 'Drip', emoji: '💦', category: 'Water', source: require('../assets/sounds/drip.m4a') },
  { id: 'wind', name: 'Wind', emoji: '🌬️', category: 'Nature', source: require('../assets/sounds/wind.m4a') },
  { id: 'wind_leaves', name: 'Wind & Leaves', emoji: '🍃', category: 'Nature', source: require('../assets/sounds/wind_leaves.m4a') },
  { id: 'forest', name: 'Forest', emoji: '🌲', category: 'Nature', source: require('../assets/sounds/forest.m4a') },
  { id: 'night', name: 'Night Crickets', emoji: '🌙', category: 'Nature', source: require('../assets/sounds/night.m4a') },
  { id: 'cave', name: 'Cave', emoji: '🕳️', category: 'Nature', source: require('../assets/sounds/cave.m4a') },
  { id: 'grassland', name: 'Grassland', emoji: '🌾', category: 'Nature', source: require('../assets/sounds/grassland.m4a') },
  { id: 'farm', name: 'Farm', emoji: '🚜', category: 'Nature', source: require('../assets/sounds/farm.m4a') },
  { id: 'fire', name: 'Crackling Fireplace', emoji: '🔥', category: 'Warmth', source: require('../assets/sounds/fire.m4a') },
  { id: 'fan', name: 'Fan', emoji: '🌀', category: 'Hum', source: require('../assets/sounds/fan.m4a') },
  { id: 'air_conditioner', name: 'Air Conditioner', emoji: '🧊', category: 'Hum', source: require('../assets/sounds/air_conditioner.m4a') },
  { id: 'airplane', name: 'Airplane Cabin', emoji: '✈️', category: 'Hum', source: require('../assets/sounds/airplane.m4a') },
  { id: 'heartbeat', name: 'Heartbeat', emoji: '💗', category: 'Calm', source: require('../assets/sounds/heartbeat.m4a') },
  { id: 'womb', name: 'Womb', emoji: '🤱', category: 'Calm', source: require('../assets/sounds/womb.m4a') },
  { id: 'singing_bowls', name: 'Singing Bowls', emoji: '🥣', category: 'Calm', source: require('../assets/sounds/singing_bowls.m4a') },
  { id: 'om_drone', name: 'Om Drone', emoji: '🕉️', category: 'Calm', source: require('../assets/sounds/om_drone.m4a') },
  { id: 'brahms_musicbox', name: 'Brahms Lullaby', emoji: '🎶', category: 'Lullaby', source: require('../assets/sounds/brahms_musicbox.m4a') },
  { id: 'twinkle_piano', name: 'Twinkle Twinkle', emoji: '⭐', category: 'Lullaby', source: require('../assets/sounds/twinkle_piano.m4a') },
  { id: 'schubert_piano', name: 'Schubert Lullaby', emoji: '🎹', category: 'Lullaby', source: require('../assets/sounds/schubert_piano.m4a') },
  { id: 'ambient_pad', name: 'Ambient Pad', emoji: '🌌', category: 'Lullaby', source: require('../assets/sounds/ambient_pad.m4a') },
  { id: 'delta_waves', name: 'Delta Waves', emoji: '🎧', category: 'Binaural', headphones: true, source: require('../assets/sounds/delta_waves.m4a') },
  { id: 'white_noise', name: 'White Noise', emoji: '⚪', category: 'Noise', source: require('../assets/sounds/white_noise.m4a') },
  { id: 'pink_noise', name: 'Pink Noise', emoji: '🌸', category: 'Noise', source: require('../assets/sounds/pink_noise.m4a') },
  { id: 'green_noise', name: 'Green Noise', emoji: '🟢', category: 'Noise', source: require('../assets/sounds/green_noise.m4a') },
  { id: 'brown_noise', name: 'Brown Noise', emoji: '🟤', category: 'Noise', source: require('../assets/sounds/brown_noise.m4a') },
  // Original synth pads (own work, Samay Vashsht). Neutral wording only, no health claims.
  { id: 'freq_432', name: '432 Hz Deep Sleep', emoji: '🌙', category: 'Frequencies', description: 'Soft 432 Hz tone under a warm low pad for sleep and relaxation', source: require('../assets/sounds/freq_432.m4a') },
  { id: 'freq_528', name: '528 Hz Calm', emoji: '🕊️', category: 'Frequencies', description: 'Gentle 528 Hz tone over a slow warm pad', source: require('../assets/sounds/freq_528.m4a') },
  { id: 'freq_963', name: '963 Hz Night', emoji: '✨', category: 'Frequencies', description: 'Quiet 963 Hz shimmer and its lower octave under a soft night pad', source: require('../assets/sounds/freq_963.m4a') },
  { id: 'freq_blend', name: '432+528 Blend', emoji: '🎐', category: 'Frequencies', description: 'Soft 432 Hz and 528 Hz tones together over a warm pad', source: require('../assets/sounds/freq_blend.m4a') },
  { id: 'deep_drone', name: 'Deep Drone', emoji: '🌑', category: 'Frequencies', description: 'Warm low drone for sleep and relaxation', source: require('../assets/sounds/deep_drone.m4a') },
];

export const SOUND_BY_ID: Record<string, Sound> = Object.fromEntries(SOUNDS.map((s) => [s.id, s]));

// minutes: null = All night: no auto-stop, the loops keep playing until you stop them.
export const TIMER_OPTIONS: { label: string; minutes: number | null }[] = [
  { label: '10 minutes', minutes: 10 },
  { label: '15 minutes', minutes: 15 },
  { label: '30 minutes', minutes: 30 },
  { label: '45 minutes', minutes: 45 },
  { label: '1 hour', minutes: 60 },
  { label: '2 hours', minutes: 120 },
  { label: '3 hours', minutes: 180 },
  { label: '4 hours', minutes: 240 },
  { label: 'All night', minutes: null },
];
