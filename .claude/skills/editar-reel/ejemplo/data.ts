// Reference only: the example reel ("segundo cerebro", recorded with a phone) as it
// lived in src/reels/ejemplo/. Its video, words.json and face.json are not in the
// repository, so this folder is read, not rendered.
import data from '../../../public/reels/ejemplo/words.json';
import face from '../../../public/reels/ejemplo/face.json';
import { loadCut } from '../../reel/cut';

export const VIDEO = 'reels/ejemplo/cut.mp4';

/** Words Whisper got wrong, by start time with one decimal. Confirmed with the speaker. */
const FIXES: Record<string, string> = { '58.4': 'IA' };

export const { duration, joins, words, at, faceAt } = loadCut(data, face, FIXES);
