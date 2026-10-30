#!/usr/bin/env python3
"""Measure a reference reel, so its style can be described in numbers.

Claude cannot watch a video: it reads still images and numbers. This turns a
reference into both.

Usage:
    python tools/analizar_referencia.py referencias/<file>.mp4 [--out referencias/<name>] [--transcribir]

Writes to the output folder (default: next to the video, named after it):
    hoja-N.jpg      contact sheets, one frame per second, 6 x 4 tiles (24 s per sheet,
                    row by row: sheet 1 is seconds 0-23, sheet 2 is 24-47...)
    gancho.jpg      the first 6 seconds at 4 frames per second (the hook, in detail)
    cuadro-SS.jpg   six frames across the video at 540 px wide, to read captions and type
    analisis.json   duration, size, cuts per minute, shot length, accent colors, loudness
                    and, with --transcribir, words per minute

The numbers are a starting point, not the style: a zoom can count as a cut, and the
accent colors include whatever bright thing is in the room. Read them with the sheets.
"""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from common import utf8_console  # noqa: E402

SCENE = 0.25
"""ffmpeg scene score above which a frame counts as a cut."""
TILE_W = 240


def probe(video):
    out = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
                          'stream=width,height,r_frame_rate:format=duration', '-of', 'json', str(video)],
                         capture_output=True, text=True, check=True).stdout
    data = json.loads(out)
    stream = data['streams'][0]
    num, den = stream['r_frame_rate'].split('/')
    return {'duration': round(float(data['format']['duration']), 2), 'width': stream['width'],
            'height': stream['height'], 'fps': round(float(num) / float(den), 2)}


def ffmpeg(*args):
    result = subprocess.run(['ffmpeg', '-v', 'error', '-y', *args], capture_output=True, text=True)
    if result.returncode != 0:
        sys.exit(result.stderr[-2000:])
    return result


def cuts(video):
    """Times where the picture changes at once: cuts, and sometimes hard zooms."""
    result = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(video), '-an', '-vf',
                             f"select='gt(scene,{SCENE})',metadata=print:file=-", '-f', 'null', '-'],
                            capture_output=True, text=True)
    return [round(float(m), 2) for m in re.findall(r'pts_time:([\d.]+)', result.stdout)]


def sheets(video, out, duration):
    tiles = 24
    count = max(1, int(np.ceil(duration / tiles)))
    for k in range(count):
        ffmpeg('-ss', str(k * tiles), '-t', str(tiles), '-i', str(video), '-vf',
               f'fps=1,scale={TILE_W}:-2,tile=6x4:padding=4:color=black', '-frames:v', '1',
               str(out / f'hoja-{k + 1}.jpg'))
    ffmpeg('-t', '6', '-i', str(video), '-vf', f'fps=4,scale={TILE_W}:-2,tile=6x4:padding=4:color=black',
           '-frames:v', '1', str(out / 'gancho.jpg'))
    for t in np.linspace(duration * 0.08, duration * 0.92, 6):
        ffmpeg('-ss', f'{t:.2f}', '-i', str(video), '-frames:v', '1', '-vf', 'scale=540:-2',
               str(out / f'cuadro-{int(t):02d}.jpg'))
    return count


def accent_colors(video):
    """Saturated, bright colors across the video, by hue, with their share."""
    w, h = 90, 160
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(video), '-vf', f'fps=2,scale={w}:{h}',
                          '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-'], capture_output=True, check=True).stdout
    frames = np.frombuffer(raw, dtype=np.uint8).reshape(-1, h, w, 3)
    pixels = frames.reshape(-1, 3)
    hsv = cv2.cvtColor(pixels.reshape(-1, 1, 3), cv2.COLOR_BGR2HSV).reshape(-1, 3)
    vivid = (hsv[:, 1] > 115) & (hsv[:, 2] > 140)
    if vivid.sum() == 0:
        return {'vivid_share_of_frame': 0.0, 'colors': []}
    hues = hsv[vivid, 0] // 15  # 12 hue bins (OpenCV hue runs 0-179)
    found = []
    for b in np.argsort(np.bincount(hues, minlength=12))[::-1][:4]:
        share = float((hues == b).mean())
        if share < 0.03:
            continue
        bgr = np.median(pixels[vivid][hues == b], axis=0).astype(int)
        found.append({'hex': '#{:02X}{:02X}{:02X}'.format(bgr[2], bgr[1], bgr[0]),
                      'share_of_vivid': round(share, 2)})
    return {'vivid_share_of_frame': round(float(vivid.mean()), 3), 'colors': found}


def loudness(video):
    result = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(video), '-af', 'ebur128', '-f', 'null', '-'],
                            capture_output=True, text=True)
    found = re.findall(r'I:\s+(-?[\d.]+) LUFS', result.stderr)
    return float(found[-1]) if found else None


def main():
    utf8_console()
    parser = argparse.ArgumentParser()
    parser.add_argument('video')
    parser.add_argument('--out', default=None)
    parser.add_argument('--transcribir', action='store_true', help='Also transcribe it, for words per minute')
    parser.add_argument('--language', default='es')
    args = parser.parse_args()

    video = Path(args.video)
    if not video.is_file():
        sys.exit(f'Not found: {video}')
    out = Path(args.out) if args.out else video.parent / video.stem[:40].strip()
    out.mkdir(parents=True, exist_ok=True)

    info = probe(video)
    d = info['duration']
    print(f"{video.name}: {d} s, {info['width']}x{info['height']}, {info['fps']} fps")
    n_sheets = sheets(video, out, d)

    times = cuts(video)
    shots = np.diff([0.0, *times, d])
    info['cuts'] = times
    info['cuts_per_minute'] = round(len(times) / d * 60, 1)
    info['median_shot_seconds'] = round(float(np.median(shots)), 2)
    info['accent'] = accent_colors(video)
    info['loudness_lufs'] = loudness(video)
    info['sheets'] = n_sheets

    if args.transcribir:
        from common import transcribe
        segments, model = transcribe(video, args.language)
        words = [w for s in segments for w in s.words]
        info['words_per_minute'] = round(len(words) / d * 60) if words else 0
        info['transcript'] = [{'start': round(s.start, 1), 'text': s.text.strip()} for s in segments]

    (out / 'analisis.json').write_text(json.dumps(info, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f"cuts: {len(times)} ({info['cuts_per_minute']} per minute), median shot {info['median_shot_seconds']} s")
    if info['accent']:
        colors = ', '.join(f"{c['hex']} ({c['share_of_vivid']:.0%})" for c in info['accent']['colors'])
        print(f"vivid colors: {colors}; vivid pixels {info['accent']['vivid_share_of_frame']:.1%} of the frame")
    print(f"loudness: {info['loudness_lufs']} LUFS")
    if 'words_per_minute' in info:
        print(f"speech: {info['words_per_minute']} words per minute")
    print(f'Sheets and frames in {out}')


if __name__ == '__main__':
    main()
