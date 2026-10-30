// Fonts a style can name. Each one loads from Google Fonts the first time a reel
// uses it. To add a family: import its loader from @remotion/google-fonts/<Name>
// and add a line to LOADERS with the weights the kit uses (500, 700, 800, 900).
import { loadFont as anton } from '@remotion/google-fonts/Anton';
import { loadFont as bebasNeue } from '@remotion/google-fonts/BebasNeue';
import { loadFont as dmSans } from '@remotion/google-fonts/DMSans';
import { loadFont as instrumentSerif } from '@remotion/google-fonts/InstrumentSerif';
import { loadFont as inter } from '@remotion/google-fonts/Inter';
import { loadFont as jetBrainsMono } from '@remotion/google-fonts/JetBrainsMono';
import { loadFont as montserrat } from '@remotion/google-fonts/Montserrat';
import { loadFont as playfairDisplay } from '@remotion/google-fonts/PlayfairDisplay';
import { loadFont as poppins } from '@remotion/google-fonts/Poppins';
import { loadFont as spaceGrotesk } from '@remotion/google-fonts/SpaceGrotesk';

const subsets: ('latin' | 'latin-ext')[] = ['latin', 'latin-ext'];

const LOADERS: Record<string, () => string> = {
  Inter: () => inter('normal', { weights: ['400', '500', '600', '700', '800', '900'], subsets }).fontFamily,
  Montserrat: () => montserrat('normal', { weights: ['500', '600', '700', '800', '900'], subsets }).fontFamily,
  Poppins: () => poppins('normal', { weights: ['500', '600', '700', '800', '900'], subsets }).fontFamily,
  'DM Sans': () => dmSans('normal', { weights: ['500', '600', '700', '800', '900'], subsets }).fontFamily,
  'Space Grotesk': () => spaceGrotesk('normal', { weights: ['500', '600', '700'], subsets }).fontFamily,
  'Bebas Neue': () => bebasNeue('normal', { weights: ['400'], subsets }).fontFamily,
  Anton: () => anton('normal', { weights: ['400'], subsets }).fontFamily,
  'Instrument Serif': () => instrumentSerif('italic', { weights: ['400'], subsets }).fontFamily,
  'Playfair Display': () => playfairDisplay('italic', { weights: ['500', '700', '800'], subsets }).fontFamily,
  'JetBrains Mono': () => jetBrainsMono('normal', { weights: ['500', '700', '800'], subsets }).fontFamily,
};

export const FONT_NAMES = Object.keys(LOADERS);

const loaded = new Map<string, string>();

/** The CSS family of a font named in the style, loading it once. */
export const fontFamily = (name: string): string => {
  const hit = loaded.get(name);
  if (hit) return hit;
  const load = LOADERS[name];
  if (!load) {
    throw new Error(`Font "${name}" is not set up. Available: ${FONT_NAMES.join(', ')}. Add it in src/reel/fonts.ts.`);
  }
  const family = load();
  loaded.set(name, family);
  return family;
};
