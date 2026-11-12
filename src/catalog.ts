export type SoundId =
  | 'rain' | 'rain_window' | 'rain_roof' | 'rain_umbrella' | 'rain_puddle' | 'snow'
  | 'ocean' | 'lake' | 'creek' | 'waterfall' | 'underwater' | 'drip'
  | 'wind' | 'wind_leaves' | 'forest' | 'night' | 'cave' | 'grassland' | 'farm'
  | 'fire' | 'thunder' | 'fan' | 'white_noise' | 'pink_noise' | 'brown_noise';

export type Category = 'Rain' | 'Water' | 'Nature' | 'Warmth' | 'Noise';

export interface Sound {
  id: SoundId;
  name: string;
  emoji: string;
  category: Category;
  source: number;
}

export const CATEGORIES: Category[] = ['Rain', 'Water', 'Nature', 'Warmth', 'Noise'];

export const SOUNDS: Sound[] = [
  { id: 'rain', name: 'Rain', emoji: '🌧️', category: 'Rain', source: require('../assets/sounds/rain.m4a') },
  { id: 'rain_window', name: 'Rain on Window', emoji: '🪟', category: 'Rain', source: require('../assets/sounds/rain_window.m4a') },
  { id: 'rain_roof', name: 'Rain on Roof', emoji: '🏠', category: 'Rain', source: require('../assets/sounds/rain_roof.m4a') },
  { id: 'rain_umbrella', name: 'Rain on Umbrella', emoji: '☂️', category: 'Rain', source: require('../assets/sounds/rain_umbrella.m4a') },
  { id: 'rain_puddle', name: 'Rain on Puddle', emoji: '💧', category: 'Rain', source: require('../assets/sounds/rain_puddle.m4a') },
  { id: 'snow', name: 'Snow', emoji: '❄️', category: 'Rain', source: require('../assets/sounds/snow.m4a') },
  { id: 'ocean', name: 'Ocean', emoji: '🌊', category: 'Water', source: require('../assets/sounds/ocean.m4a') },
  { id: 'lake', name: 'Lake', emoji: '🏞️', category: 'Water', source: require('../assets/sounds/lake.m4a') },
  { id: 'creek', name: 'Creek', emoji: '🪨', category: 'Water', source: require('../assets/sounds/creek.m4a') },
  { id: 'waterfall', name: 'Waterfall', emoji: '⛲', category: 'Water', source: require('../assets/sounds/waterfall.m4a') },
  { id: 'underwater', name: 'Underwater', emoji: '🫧', category: 'Water', source: require('../assets/sounds/underwater.m4a') },
  { id: 'drip', name: 'Drip', emoji: '💦', category: 'Water', source: require('../assets/sounds/drip.m4a') },
  { id: 'wind', name: 'Wind', emoji: '🌬️', category: 'Nature', source: require('../assets/sounds/wind.m4a') },
  { id: 'wind_leaves', name: 'Wind & Leaves', emoji: '🍃', category: 'Nature', source: require('../assets/sounds/wind_leaves.m4a') },
  { id: 'forest', name: 'Forest', emoji: '🌲', category: 'Nature', source: require('../assets/sounds/forest.m4a') },
  { id: 'night', name: 'Night', emoji: '🌙', category: 'Nature', source: require('../assets/sounds/night.m4a') },
  { id: 'cave', name: 'Cave', emoji: '🕳️', category: 'Nature', source: require('../assets/sounds/cave.m4a') },
  { id: 'grassland', name: 'Grassland', emoji: '🌾', category: 'Nature', source: require('../assets/sounds/grassland.m4a') },
  { id: 'farm', name: 'Farm', emoji: '🚜', category: 'Nature', source: require('../assets/sounds/farm.m4a') },
  { id: 'fire', name: 'Fireplace', emoji: '🔥', category: 'Warmth', source: require('../assets/sounds/fire.m4a') },
  { id: 'thunder', name: 'Thunder', emoji: '⛈️', category: 'Warmth', source: require('../assets/sounds/thunder.m4a') },
  { id: 'fan', name: 'Fan', emoji: '🌀', category: 'Warmth', source: require('../assets/sounds/fan.m4a') },
  { id: 'white_noise', name: 'White Noise', emoji: '⚪', category: 'Noise', source: require('../assets/sounds/white_noise.m4a') },
  { id: 'pink_noise', name: 'Pink Noise', emoji: '🌸', category: 'Noise', source: require('../assets/sounds/pink_noise.m4a') },
  { id: 'brown_noise', name: 'Brown Noise', emoji: '🟤', category: 'Noise', source: require('../assets/sounds/brown_noise.m4a') },
];

export const SOUND_BY_ID: Record<string, Sound> = Object.fromEntries(SOUNDS.map((s) => [s.id, s]));

export const TIMER_OPTIONS: { label: string; minutes: number }[] = [
  { label: 'No timer', minutes: 0 },
  { label: '10 minutes', minutes: 10 },
  { label: '15 minutes', minutes: 15 },
  { label: '30 minutes', minutes: 30 },
  { label: '45 minutes', minutes: 45 },
  { label: '1 hour', minutes: 60 },
  { label: '2 hours', minutes: 120 },
  { label: '3 hours', minutes: 180 },
];
