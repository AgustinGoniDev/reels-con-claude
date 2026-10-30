// The cut made by tools/cut.py (plan: reels/SLUG/plan.json).
import data from '../../../public/reels/SLUG/words.json';
import face from '../../../public/reels/SLUG/face.json';
import { loadCut } from '../../reel/cut';

export const VIDEO = 'reels/SLUG/cut.mp4';

/**
 * Words Whisper got wrong, by start time with one decimal: { '58.4': 'IA' }.
 * Each fix is confirmed with the speaker before it goes here.
 */
const FIXES: Record<string, string> = {};

export const { duration, joins, words, at, faceAt } = loadCut(data, face, FIXES);
