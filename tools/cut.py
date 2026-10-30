#!/usr/bin/env python3
"""Cut a reel out of a recording, ready for motion graphics.

Keeps the planned segments in the planned order, removes the pauses inside
them, crops the camera image, speeds it up, and writes every kept word with
its time in the new video. No subtitles and no graphics: those are drawn later
(Remotion), on top of this file.

Usage:
    python tools/cut.py reels/<slug>/plan.json --check   # report only
    python tools/cut.py reels/<slug>/plan.json           # report and render

Plan (JSON):
    {
      "source": "videos/my-recording.mov",  # relative to the project folder, or absolute
      "words": "source_words.json",          # tools/transcribe.py output, relative to the plan
      "out": "../../public/reels/<slug>",    # output folder, relative to the plan
      "camera": {"x": 0, "y": 0, "w": 1080, "h": 1920},
      "speed": 1.1,
      "fps": 30,
      "segments": [{"start": 0.95, "end": 73.3, "text": "what is said"}]
    }

Optional plan keys: "language" (default "es"); "vocabulary", a comma-separated list
of names Whisper must spell right ("ChatGPT, Claude"); "min_pause", the shortest
pause that is removed, in seconds (default 0.30); "denoise" (default true), voice
cleanup with RNNoise; and "patches", privacy blurs in source seconds and pixels:
[{"from", "to", "x", "y", "w", "h", "why"}].

The voice is cleaned (RNNoise) and leveled to -14 LUFS once, over the whole cut.

Outputs, in the output folder:
    cut.mp4      the camera image only
    words.json   words, segments and joins on the timeline of cut.mp4

The words are transcribed again from cut.mp4, not mapped from the source
transcription: Whisper's source timings can be off by a quarter of a second,
enough to drop a word at a segment edge or to show a caption early.
"""
import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from common import MODELS, VOICE_MODEL, require, transcribe, utf8_console  # noqa: E402

PROJECT = Path(__file__).resolve().parent.parent

HOP = 0.01
"""Resolution of the loudness curve, in seconds."""
SMOOTH = 3
"""Hops averaged together, so a stop consonant does not read as silence."""
SNAP_RADIUS = 0.12
"""How far a segment edge may move to reach the quietest instant."""
SILENCE_MIN = 0.30
"""A pause at least this long inside a segment is removed (plan key "min_pause")."""
SILENCE_KEEP = 0.08
"""Air left at each side of a removed pause."""
SILENCE_BELOW_SPEECH_DB = 20.0
"""dB below the median speech level that count as silence. Measured against the
voice, not the noise floor: noise suppression in recording apps gates some pauses
to digital silence (-86 dB) while others keep the room tone (-55 to -65 dB)."""
VOICE_DB = -35.0
"""An edge louder than this probably cuts through a word."""
FADE = 0.012
"""Audio fade at both sides of each join, so cuts do not click."""
AUDIO_RATE = 16000
LOUDNESS = 'loudnorm=I=-14:TP=-1.5:LRA=11'
"""-14 LUFS: what Instagram, TikTok and YouTube normalize to."""
DENOISE = f'asetnsamples=n=480:p=1,arnndn=m={VOICE_MODEL.name}'
"""RNNoise with std.rnnn (the model of the original RNNoise). asetnsamples feeds arnndn
exact 480-sample blocks: without it ffmpeg 9 ends the audio with NaN samples and
sometimes crashes."""
DENOISE_DELAY = 0.010
"""arnndn delays the audio by 10 ms (measured on ffmpeg 9.0.1); trimmed back."""
BATCH = 10
"""Pieces per ffmpeg run. Many inputs of one long file in a single graph is slow and
has produced truncated video before; batches are rendered apart and joined."""
BLUR_SIGMA = 24
"""Gaussian blur over privacy patches (names on screen)."""


def load_json(path):
    return json.loads(Path(path).read_text(encoding='utf-8'))


def read_words(path):
    """Flat list of {text, start, end} from transcribe.py's JSON."""
    data = load_json(path)
    return [{'text': w['texto'].strip(), 'start': w['inicio'], 'end': w['fin']}
            for seg in data['segmentos'] for w in seg['palabras']]


def energy_db(source):
    """Loudness of the source every HOP seconds, in dBFS."""
    cmd = ['ffmpeg', '-v', 'error', '-i', str(source), '-vn', '-ac', '1',
           '-ar', str(AUDIO_RATE), '-f', 'f32le', '-']
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    samples = np.frombuffer(raw, dtype=np.float32)
    hop = int(AUDIO_RATE * HOP)
    n = len(samples) // hop
    rms = np.sqrt(np.mean(samples[:n * hop].reshape(n, hop) ** 2, axis=1))
    rms = np.convolve(rms, np.ones(SMOOTH) / SMOOTH, mode='same')
    return 20 * np.log10(rms + 1e-9)


def snap(t, db):
    """Move an edge to the quietest instant within SNAP_RADIUS."""
    i = int(round(t / HOP))
    r = int(round(SNAP_RADIUS / HOP))
    lo, hi = max(0, i - r), min(len(db), i + r + 1)
    j = lo + int(np.argmin(db[lo:hi]))
    return j * HOP, float(db[j])


def pauses(a, b, db, threshold, min_pause):
    """Spans inside [a, b] quieter than threshold for at least min_pause."""
    i0, i1 = int(round(a / HOP)), int(round(b / HOP))
    quiet = np.append(db[i0:i1] < threshold, False)
    spans, start = [], None
    for k, q in enumerate(quiet):
        if q and start is None:
            start = k
        elif not q and start is not None:
            if (k - start) * HOP >= min_pause:
                spans.append(((i0 + start) * HOP, (i0 + k) * HOP))
            start = None
    return spans


def kept_pieces(a, b, spans):
    """[a, b] minus each pause, leaving SILENCE_KEEP of air at both sides."""
    pieces, cursor = [], a
    for p0, p1 in spans:
        if p0 > a + HOP:
            pieces.append((cursor, min(p0 + SILENCE_KEEP, b)))
        if p1 >= b - HOP:
            return pieces
        cursor = max(cursor, p1 - SILENCE_KEEP)
    pieces.append((cursor, b))
    return pieces


def encoder_args():
    listed = subprocess.run(['ffmpeg', '-hide_banner', '-encoders'], capture_output=True, text=True).stdout
    if 'h264_nvenc' in listed:
        return ['-c:v', 'h264_nvenc', '-preset', 'p5', '-rc', 'vbr', '-cq', '19', '-b:v', '0']
    return ['-c:v', 'libx264', '-preset', 'medium', '-crf', '18']


def run_ffmpeg(cmd, tail, cwd=None):
    """Run with NVENC when available, falling back to libx264."""
    result = subprocess.run(cmd + encoder_args() + tail, capture_output=True, text=True, cwd=cwd)
    if result.returncode != 0 and 'h264_nvenc' in ' '.join(encoder_args()):
        print('  NVENC failed, falling back to libx264')
        result = subprocess.run(cmd + ['-c:v', 'libx264', '-preset', 'medium', '-crf', '18'] + tail,
                                capture_output=True, text=True, cwd=cwd)
    if result.returncode != 0:
        sys.exit(result.stderr[-3000:])


def render_batch(source, camera, pieces, patches, speed, fps, out):
    """Cut, crop, blur and speed up some pieces into one part (PCM audio, so parts join without gaps)."""
    cmd = ['ffmpeg', '-v', 'error', '-y']
    for p0, p1 in pieces:
        cmd += ['-ss', f'{p0:.4f}', '-t', f'{p1 - p0:.4f}', '-i', str(source)]
    crop = f'crop={camera["w"]}:{camera["h"]}:{camera["x"]}:{camera["y"]}'
    parts, labels = [], ''
    for i, (p0, p1) in enumerate(pieces):
        d = p1 - p0
        current = f'b{i}'
        # Trim both streams to the exact piece length: input seeking hands over whole audio
        # packets (21 ms each), and over 280 pieces that drifted the timeline by a second.
        parts.append(f'[{i}:v]{crop},trim=duration={d:.4f},setpts=PTS-STARTPTS[{current}]')
        # Privacy patches are in source seconds and source pixels; inside a piece time starts at 0.
        local = [(max(pt['from'], p0) - p0, min(pt['to'], p1) - p0, pt) for pt in patches
                 if pt['to'] > p0 and pt['from'] < p1]
        for k, (a, b, pt) in enumerate(local):
            x, y = pt['x'] - camera['x'], pt['y'] - camera['y']
            parts.append(f'[{current}]split[m{i}_{k}][s{i}_{k}]')
            parts.append(f"[s{i}_{k}]crop={pt['w']}:{pt['h']}:{x}:{y},gblur=sigma={BLUR_SIGMA}[g{i}_{k}]")
            parts.append(f"[m{i}_{k}][g{i}_{k}]overlay={x}:{y}:enable='between(t,{a:.3f},{b:.3f})'[o{i}_{k}]")
            current = f'o{i}_{k}'
        # Each piece becomes exactly `frames` output frames, and its audio exactly as long,
        # so the computed timeline (words.json joins and segments) is the real one.
        frames = round(d / speed * fps)
        parts.append(f'[{current}]setpts=PTS/{speed},fps={fps},tpad=stop_mode=clone:stop=2,'
                     f'trim=end_frame={frames},setpts=PTS-STARTPTS[v{i}]')
        parts.append(f'[{i}:a]asetpts=PTS-STARTPTS,atrim=duration={d:.4f},'
                     f'afade=t=in:d={FADE},afade=t=out:st={d - FADE:.4f}:d={FADE},'
                     f'atempo={speed},apad,atrim=duration={frames / fps:.6f}[a{i}]')
        labels += f'[v{i}][a{i}]'
    parts.append(f'{labels}concat=n={len(pieces)}:v=1:a=1[vc][ac]')
    parts.append('[vc]format=yuv420p[v]')
    parts.append('[ac]anull[a]')
    cmd += ['-filter_complex', ';'.join(parts), '-map', '[v]', '-map', '[a]']
    run_ffmpeg(cmd, ['-c:a', 'pcm_s16le', str(out)])


def render(source, camera, pieces, patches, speed, fps, denoise, out):
    """Render in batches, join them, then clean and level the voice once over the whole cut."""
    with tempfile.TemporaryDirectory(prefix='cut-') as tmp:
        tmp = Path(tmp)
        batches = [pieces[i:i + BATCH] for i in range(0, len(pieces), BATCH)]
        for n, batch in enumerate(batches):
            print(f'  batch {n + 1}/{len(batches)} ({len(batch)} pieces)')
            render_batch(source, camera, batch, patches, speed, fps, tmp / f'part{n:03d}.mkv')
        listing = tmp / 'parts.txt'
        listing.write_text(''.join(f"file '{(tmp / f'part{n:03d}.mkv').as_posix()}'\n" for n in range(len(batches))),
                           encoding='utf-8')
        joined = tmp / 'joined.mkv'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(listing),
                        '-c', 'copy', str(joined)], check=True)
        clean = f'{DENOISE},atrim=start={DENOISE_DELAY},asetpts=PTS-STARTPTS,' if denoise else ''
        voice = f'highpass=f=80,{clean}{LOUDNESS},aresample=48000'
        # arnndn reads its model by a relative path: run from tools/models (Windows paths break filter args).
        result = subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(joined), '-map', '0:v', '-map', '0:a',
                                 '-c:v', 'copy', '-af', voice, '-c:a', 'aac', '-b:a', '192k',
                                 '-movflags', '+faststart', str(out)], capture_output=True, text=True, cwd=MODELS)
        if result.returncode != 0:
            sys.exit(result.stderr[-3000:])


def main():
    utf8_console()
    parser = argparse.ArgumentParser(description='Cut a reel out of a recording.')
    parser.add_argument('plan')
    parser.add_argument('--check', action='store_true', help='Report edges and pauses, do not render')
    args = parser.parse_args()

    plan_path = Path(args.plan).resolve()
    plan = load_json(plan_path)
    source = Path(plan['source'])
    if not source.is_absolute():
        source = PROJECT / source
    if not source.is_file():
        sys.exit(f'Source video not found: {source}')
    speed = float(plan.get('speed', 1.0))
    fps = int(plan.get('fps', 30))
    min_pause = float(plan.get('min_pause', SILENCE_MIN))
    denoise = bool(plan.get('denoise', True))
    if denoise and not args.check:
        require(VOICE_MODEL, 'the voice cleanup model')
    words = read_words(plan_path.parent / plan['words'])
    # One output frame, in source seconds. On a 60 fps source at 1.0x and 30 fps it lands on source frames too.
    frame = speed / fps

    db = energy_db(source)
    floor = float(np.percentile(db, 5))
    speech = [db[int(w['start'] / HOP):int(w['end'] / HOP)] for w in words]
    speech_db = float(np.median(np.concatenate([s for s in speech if len(s)])))
    threshold = speech_db - SILENCE_BELOW_SPEECH_DB
    print(f'{source.name}: noise floor {floor:.0f} dB, speech {speech_db:.0f} dB, '
          f'silence below {threshold:.0f} dB')

    all_pieces, segments, joins = [], [], []
    offset = 0.0
    for n, seg in enumerate(plan['segments'], 1):
        a, la = snap(seg['start'], db)
        b, lb = snap(seg['end'], db)
        warn_a = '  <- loud: may cut a word' if la > VOICE_DB else ''
        warn_b = '  <- loud: may cut a word' if lb > VOICE_DB else ''
        print(f'\n{n}. {seg.get("text", "")[:70]}')
        print(f'   start {seg["start"]:.2f} -> {a:.2f} s ({la:.0f} dB){warn_a}')
        print(f'   end   {seg["end"]:.2f} -> {b:.2f} s ({lb:.0f} dB){warn_b}')
        pieces = kept_pieces(a, b, pauses(a, b, db, threshold, min_pause))
        # Pieces are a whole number of output frames long, so every batch joins with no rounding.
        pieces = [(round(p0 / frame) * frame, round(p1 / frame) * frame) for p0, p1 in pieces]
        pieces = [(p0, p1) for p0, p1 in pieces if p1 - p0 > frame]
        if not pieces:
            sys.exit(f'   segment {n} is all silence')
        for (_, e0), (s1, _) in zip(pieces, pieces[1:]):
            print(f'   pause removed: {e0:.2f} -> {s1:.2f} s ({s1 - e0:.2f} s)')

        length = sum(p1 - p0 for p0, p1 in pieces)
        acc = offset
        for p0, p1 in pieces[:-1]:
            acc += p1 - p0
            joins.append({'time': round(acc / speed, 3), 'kind': 'pause'})
        segments.append({'index': n, 'start': round(offset / speed, 3),
                         'end': round((offset + length) / speed, 3), 'text': seg.get('text', '')})
        offset += length
        if n < len(plan['segments']):
            joins.append({'time': round(offset / speed, 3), 'kind': 'segment'})
        all_pieces += pieces

    duration = offset / speed
    print(f'\n{len(plan["segments"])} segments, {len(all_pieces)} pieces, '
          f'{duration:.2f} s after removing pauses and speeding up {speed}x')
    if args.check:
        return

    out_dir = (plan_path.parent / plan.get('out', 'out')).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / 'cut.mp4'
    print(f'Rendering {out}...')
    render(source, plan['camera'], all_pieces, plan.get('patches', []), speed, fps, denoise, out)
    print('Transcribing the cut for exact word times...')
    segments_out, _ = transcribe(out, plan.get('language', 'es'), plan.get('vocabulary'))
    kept_words = [{'text': w.word.strip(), 'start': round(w.start, 3), 'end': round(w.end, 3)}
                  for s in segments_out for w in s.words]
    for w in kept_words:
        mid = (w['start'] + w['end']) / 2
        w['segment'] = next((s['index'] for s in segments if mid < s['end']), segments[-1]['index'])
    meta = {
        'video': 'cut.mp4',
        'fps': fps,
        'speed': speed,
        'duration': round(duration, 3),
        'width': plan['camera']['w'],
        'height': plan['camera']['h'],
        'segments': segments,
        'joins': joins,
        'words': kept_words,
    }
    (out_dir / 'words.json').write_text(json.dumps(meta, ensure_ascii=False, indent=2) + '\n',
                                        encoding='utf-8')
    print(f'Done: {out.name} and words.json ({len(kept_words)} words, {len(joins)} joins)')


if __name__ == '__main__':
    main()
