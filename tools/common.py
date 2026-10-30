"""Shared helpers: console encoding, Whisper on the GPU or the CPU, model paths."""
import importlib
import os
import sys
from pathlib import Path

MODELS = Path(__file__).parent / 'models'
FACE_MODEL = MODELS / 'face_detection_yunet_2026may.onnx'
VOICE_MODEL = MODELS / 'std.rnnn'

GPU_MODEL = 'large-v3-turbo'
"""Whisper model on an NVIDIA GPU (about 1.6 GB, downloaded on first use)."""
CPU_MODEL = 'small'
"""Whisper model on the CPU (about 0.5 GB): slower and less precise, fine for a reel."""


def utf8_console():
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, 'reconfigure'):
            stream.reconfigure(encoding='utf-8')


def require(path, what):
    """Exit with a clear next step when a downloaded model is missing."""
    if not Path(path).is_file():
        sys.exit(f'Missing {what}: {path}\nRun: python tools/preparar.py --instalar')


def load_cuda_dlls():
    """faster-whisper's CUDA libraries come as pip packages (nvidia-cublas-cu12,
    nvidia-cudnn-cu12). On Windows they are only found if their bin/ folders are
    on PATH before ctranslate2 loads; otherwise: `cublas64_12.dll is not found`."""
    dirs = []
    for package in ('nvidia.cublas', 'nvidia.cudnn'):
        try:
            module = importlib.import_module(package)
        except ImportError:
            continue
        dirs += [str(Path(p) / 'bin') for p in module.__path__ if (Path(p) / 'bin').is_dir()]
    os.environ['PATH'] = os.pathsep.join(dirs + [os.environ.get('PATH', '')])
    if hasattr(os, 'add_dll_directory'):
        for d in dirs:
            os.add_dll_directory(d)


def has_cuda():
    try:
        import ctranslate2
        return ctranslate2.get_cuda_device_count() > 0
    except Exception:
        return False


def transcribe(video, language='es', vocabulary=None, model=None):
    """Whisper segments with word times. GPU when there is one, else the CPU.

    Returns (segments, model_name), where each segment is a faster-whisper Segment.
    """
    load_cuda_dlls()
    from faster_whisper import WhisperModel

    def run(name, device, compute):
        print(f"Transcribing with Whisper {name} on the {'GPU' if device == 'cuda' else 'CPU'}...")
        whisper = WhisperModel(name, device=device, compute_type=compute)
        segments, _ = whisper.transcribe(str(video), language=language, word_timestamps=True,
                                         initial_prompt=vocabulary or None)
        return list(segments), name

    if has_cuda():
        try:
            return run(model or GPU_MODEL, 'cuda', 'float16')
        except (RuntimeError, ValueError) as error:
            print(f'  GPU transcription failed ({error}); using the CPU')
    return run(model or CPU_MODEL, 'cpu', 'int8')
