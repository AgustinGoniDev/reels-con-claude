#!/usr/bin/env python3
"""Check that this machine can edit reels, and install what the project itself needs.

Usage:
    python tools/preparar.py              # check only, changes nothing
    python tools/preparar.py --instalar   # Python packages, Node packages and the two small models
    python tools/preparar.py --whisper    # download the Whisper model for this machine (0.5-1.6 GB)

It never installs Node, Python or ffmpeg: those are programs of the system. When
one is missing it prints the command that installs it on Windows and on macOS.
"""
import argparse
import platform
import re
import shutil
import subprocess
import sys
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from common import CPU_MODEL, FACE_MODEL, GPU_MODEL, MODELS, VOICE_MODEL, has_cuda, utf8_console  # noqa: E402

PROJECT = Path(__file__).resolve().parent.parent
WINDOWS = platform.system() == 'Windows'

DOWNLOADS = {
    FACE_MODEL: ('https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/'
                 'face_detection_yunet_2026may.onnx', 'YuNet face detector, OpenCV Zoo, MIT license'),
    VOICE_MODEL: ('https://raw.githubusercontent.com/richardpl/arnndn-models/master/std.rnnn',
                  'RNNoise voice model (std.rnnn, the original RNNoise model)'),
}

SYSTEM_INSTALL = {
    'node': ('winget install OpenJS.NodeJS.LTS', 'brew install node'),
    'ffmpeg': ('winget install Gyan.FFmpeg', 'brew install ffmpeg'),
}

problems = []


def report(ok, what, detail='', fix=''):
    print(f"  [{'ok' if ok else '--'}] {what}{': ' + detail if detail else ''}")
    if not ok:
        problems.append((what, fix))


def version_of(cmd):
    try:
        out = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        return (out.stdout or out.stderr).strip().splitlines()[0]
    except (OSError, subprocess.TimeoutExpired, IndexError):
        return None


def system_fix(name):
    win, mac = SYSTEM_INSTALL[name]
    return f'Windows: {win}  |  macOS: {mac}  (then open a new terminal)'


def check_node():
    v = version_of(['node', '--version'])
    major = int(re.findall(r'\d+', v)[0]) if v else 0
    report(major >= 18, 'Node 18 or newer', v or 'not found', system_fix('node'))
    installed = (PROJECT / 'node_modules' / 'remotion').is_dir()
    report(installed, 'Project packages (Remotion)', '' if installed else 'not installed',
           'python tools/preparar.py --instalar')


def check_ffmpeg():
    v = version_of(['ffmpeg', '-hide_banner', '-version'])
    report(v is not None and shutil.which('ffprobe') is not None, 'ffmpeg and ffprobe', v or 'not found',
           system_fix('ffmpeg'))
    if v:
        filters = subprocess.run(['ffmpeg', '-hide_banner', '-filters'], capture_output=True, text=True).stdout
        report('arnndn' in filters, 'ffmpeg voice cleanup filter (arnndn)', '',
               'Install a full ffmpeg build: ' + system_fix('ffmpeg'))


def check_python():
    ok = sys.version_info >= (3, 9)
    report(ok, 'Python 3.9 or newer', platform.python_version(), 'Install Python 3.11 or newer from python.org')
    for module, label in (('numpy', 'numpy'), ('cv2', 'opencv-python'), ('faster_whisper', 'faster-whisper')):
        try:
            mod = __import__(module)
            report(True, label, getattr(mod, '__version__', ''))
        except ImportError:
            report(False, label, 'not installed', 'python tools/preparar.py --instalar')
    try:
        import cv2
        report(hasattr(cv2, 'FaceDetectorYN'), 'OpenCV face detector', '', 'pip install --upgrade opencv-python')
    except ImportError:
        pass


def check_models():
    for path, (_, label) in DOWNLOADS.items():
        report(path.is_file(), label, path.name if path.is_file() else 'not downloaded',
               'python tools/preparar.py --instalar')


def whisper_cached(name):
    roots = [Path.home() / '.cache' / 'huggingface' / 'hub']
    return any(p.is_dir() for root in roots if root.is_dir() for p in root.glob(f'models--*faster-whisper-{name}'))


def check_whisper():
    gpu = has_cuda()
    name = GPU_MODEL if gpu else CPU_MODEL
    print(f"  [..] Transcription on the {'GPU (NVIDIA)' if gpu else 'CPU (no NVIDIA GPU found)'} with Whisper {name}")
    cached = whisper_cached(name)
    size = '1.6 GB' if name == GPU_MODEL else '0.5 GB'
    print(f"  [{'ok' if cached else '..'}] Whisper {name}: "
          f"{'downloaded' if cached else f'not downloaded yet ({size}); python tools/preparar.py --whisper'}")


def install():
    print('Installing Python packages...')
    subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', str(PROJECT / 'requirements.txt')], check=True)
    npm = 'npm.cmd' if WINDOWS else 'npm'
    if shutil.which(npm):
        print('Installing Node packages...')
        subprocess.run([npm, 'install', '--no-audit', '--no-fund'], cwd=PROJECT, check=True)
    else:
        print('Node is missing: install it first, then run this again.')
    MODELS.mkdir(exist_ok=True)
    for path, (url, label) in DOWNLOADS.items():
        if path.is_file():
            continue
        print(f'Downloading {label}...')
        urllib.request.urlretrieve(url, path)
        print(f'  {path.name}: {path.stat().st_size // 1024} KB')


def download_whisper():
    from common import load_cuda_dlls
    load_cuda_dlls()
    from faster_whisper import WhisperModel
    gpu = has_cuda()
    name = GPU_MODEL if gpu else CPU_MODEL
    print(f'Downloading Whisper {name}...')
    WhisperModel(name, device='cuda' if gpu else 'cpu', compute_type='float16' if gpu else 'int8')
    print('Done.')


def main():
    utf8_console()
    parser = argparse.ArgumentParser()
    parser.add_argument('--instalar', action='store_true')
    parser.add_argument('--whisper', action='store_true')
    args = parser.parse_args()

    if args.instalar:
        install()
    if args.whisper:
        download_whisper()

    print(f'\nThis machine: {platform.system()} {platform.machine()}')
    check_node()
    check_ffmpeg()
    check_python()
    check_models()
    if not any(label in ('faster-whisper',) for label, _ in problems):
        check_whisper()

    if problems:
        print('\nMissing:')
        for what, fix in problems:
            print(f'  - {what} -> {fix}')
        sys.exit(1)
    print('\nReady.')


if __name__ == '__main__':
    main()
