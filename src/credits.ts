// Sound credits shown in Settings > Sound credits. Mirrors ASSET_LICENSES.md (a test keeps them in sync).

export interface Credit {
  title: string;
  body: string;
  links?: { label: string; url: string }[];
}

export const CREDITS: Credit[] = [
  {
    title: 'Farm',
    body: '"farmland at river-village Lage-Zwaluwe" by klankbeeld (Freesound 840052), licensed under CC BY 4.0. Changes: trimmed, equalised, compressed, level-matched and looped.',
    links: [
      { label: 'Recording on Freesound', url: 'https://freesound.org/s/840052/' },
      { label: 'CC BY 4.0 licence', url: 'https://creativecommons.org/licenses/by/4.0/' },
    ],
  },
  {
    title: 'Other field recordings',
    body: 'All other recordings come from Freesound under CC0 1.0 (public domain). No attribution is required; their authors are thanked on the support page.',
    links: [{ label: 'CC0 1.0', url: 'https://creativecommons.org/publicdomain/zero/1.0/' }],
  },
  {
    title: 'Frequencies',
    body: '432 Hz Deep Sleep, 528 Hz Calm, 963 Hz Night, 432+528 Blend and Deep Drone are original loops by Samay Vashsht, made for Lulla.',
  },
  {
    title: 'Noises, tones and lullabies',
    body: 'White, pink, green and brown noise, Om Drone and Delta Waves are generated in-house. Lullabies are public-domain melodies rendered in-house with the FluidR3 GM soundfont (MIT).',
  },
];

export const CREDITS_PAGE_URL = 'https://samayhuf-star.github.io/app-legal/lulla/support.html#sound-credits';
