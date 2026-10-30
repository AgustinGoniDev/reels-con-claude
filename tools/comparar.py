#!/usr/bin/env python3
"""Put two preview renders side by side, A on the left and B on the right.

Usage:
    python tools/comparar.py out/vistas/<slug>-a.mp4 out/vistas/<slug>-b.mp4 out/vistas/<slug>-comparada.mp4

The sound is A's. Each side is 540x960, so the result is 1080x960.
"""
import subprocess
import sys


def main():
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    a, b, out = sys.argv[1:]
    graph = '[0:v]scale=540:960[a];[1:v]scale=540:960[b];[a][b]hstack=inputs=2[v]'
    result = subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', a, '-i', b, '-filter_complex', graph,
                             '-map', '[v]', '-map', '0:a?', '-c:v', 'libx264', '-crf', '20', '-preset', 'veryfast',
                             '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', out],
                            capture_output=True, text=True)
    if result.returncode != 0:
        sys.exit(result.stderr[-2000:])
    print(f'Done: {out} (A left, B right)')


if __name__ == '__main__':
    main()
