#!/usr/bin/env python3
"""Track the speaker's face in every frame, for graphics that must not cover it.

Usage:
    python tools/track_face.py public/reels/<slug>/cut.mp4 public/reels/<slug>/face.json

Writes {"fps", "width", "height", "frames": [[cx, cy, w, h, eye_y], ...]} in the
video's pixels, one entry per frame. Detection runs on a quarter-size frame with
YuNet (OpenCV Zoo, MIT license), then the track is smoothed so boxes do not jitter.
A frame without a detection keeps the last known box.
"""
import json
import sys
from pathlib import Path

import cv2

sys.path.insert(0, str(Path(__file__).parent))
from common import FACE_MODEL, require, utf8_console  # noqa: E402

SCALE = 0.25
SMOOTH = 0.35
"""Exponential smoothing: weight of the new detection against the track."""


def main():
    utf8_console()
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    video, out = sys.argv[1], sys.argv[2]
    require(FACE_MODEL, 'the face model')
    cap = cv2.VideoCapture(video)
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    small = (int(width * SCALE), int(height * SCALE))
    detector = cv2.FaceDetectorYN.create(str(FACE_MODEL), '', small, 0.6, 0.3, 5000)

    frames, track, missed = [], None, 0
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        _, faces = detector.detect(cv2.resize(frame, small))
        if faces is not None and len(faces):
            f = max(faces, key=lambda r: r[2] * r[3])
            x, y, w, h = (float(v) / SCALE for v in f[:4])
            eye_y = (float(f[5]) + float(f[7])) / 2 / SCALE
            box = [x + w / 2, y + h / 2, w, h, eye_y]
            track = box if track is None else [t + SMOOTH * (b - t) for t, b in zip(track, box)]
        else:
            missed += 1
        frames.append([round(v, 1) for v in track] if track else None)
    cap.release()

    if not any(frames):
        sys.exit('No face found in the video.')
    first = next(f for f in frames if f)
    frames = [f or first for f in frames]
    Path(out).write_text(json.dumps({'fps': fps, 'width': width, 'height': height, 'frames': frames}),
                         encoding='utf-8')
    xs = [f[0] for f in frames]
    eyes = [f[4] for f in frames]
    print(f'{len(frames)} frames, {missed} without a face; center x {min(xs):.0f}-{max(xs):.0f}, '
          f'eyes y {min(eyes):.0f}-{max(eyes):.0f}, '
          f'median box {sorted(f[2] for f in frames)[len(frames) // 2]:.0f} px wide')


if __name__ == '__main__':
    main()
