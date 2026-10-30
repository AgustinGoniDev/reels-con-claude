#!/usr/bin/env python3
"""Transcribe a recording with word times, in the format tools/cut.py reads.

Usage:
    python tools/transcribe.py "<video>" <out.json> [--vocabulary "Claude, ChatGPT"] [--language es] [--model small]

Writes <out.json> ({"archivo", "idioma", "segmentos": [{"inicio", "fin", "texto",
"palabras": [{"inicio", "fin", "texto", "prob"}]}]}) and prints the text with times.
Words Whisper was unsure about (probability under 0.5) are marked with [?] so they
can be confirmed with the speaker before anything is drawn on them.
"""
import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from common import transcribe, utf8_console  # noqa: E402

DOUBT = 0.5


def main():
    utf8_console()
    parser = argparse.ArgumentParser()
    parser.add_argument('video')
    parser.add_argument('out')
    parser.add_argument('--language', default='es')
    parser.add_argument('--vocabulary', default=None, help='Names Whisper must spell right, comma-separated')
    parser.add_argument('--model', default=None, help='Whisper model (default: large-v3-turbo on GPU, small on CPU)')
    args = parser.parse_args()

    segments, model = transcribe(args.video, args.language, args.vocabulary, args.model)
    data = {
        'archivo': str(Path(args.video).resolve()),
        'idioma': args.language,
        'modelo': model,
        'segmentos': [
            {
                'inicio': round(s.start, 2),
                'fin': round(s.end, 2),
                'texto': s.text.strip(),
                'palabras': [{'inicio': round(w.start, 2), 'fin': round(w.end, 2), 'texto': w.word.strip(),
                              'prob': round(w.probability, 2)} for w in s.words],
            }
            for s in segments
        ],
    }
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    doubts = 0
    for s in data['segmentos']:
        text = ' '.join(f"{w['texto']}[?]" if w['prob'] < DOUBT else w['texto'] for w in s['palabras'])
        doubts += sum(w['prob'] < DOUBT for w in s['palabras'])
        print(f"[{s['inicio']:.1f}s -> {s['fin']:.1f}s] {text}")
    print(f'\n{doubts} doubtful words marked [?]')


if __name__ == '__main__':
    main()
