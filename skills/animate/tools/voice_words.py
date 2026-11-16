#!/usr/bin/env python3
"""Word timings for a voice-over, read from the audio itself (faster-whisper or whisper, local, no API).
   usage: python tools/voice_words.py <voice.wav> [--model small.en]
   prints JSON: [{"w": "word", "t0": 1.23, "t1": 1.51}, ...]
Called by tools/voice.mjs; falls back to an estimate when neither whisper is installed."""
import json
import sys


def transcribe_faster(wav, model_name):
    from faster_whisper import WhisperModel
    m = WhisperModel(model_name, device='cpu', compute_type='int8')
    segs, _ = m.transcribe(wav, word_timestamps=True, vad_filter=False, beam_size=5, language='en')
    out = []
    for s in segs:
        for w in s.words or []:
            out.append({'w': w.word.strip(), 't0': round(float(w.start), 3), 't1': round(float(w.end), 3)})
    return out


def transcribe_standard(wav, model_name):
    import whisper
    target = 'tiny.en' if 'tiny' in model_name or 'small' in model_name else 'base.en'
    m = whisper.load_model(target)
    res = m.transcribe(wav, word_timestamps=True, fp16=False)
    out = []
    for s in res.get('segments', []):
        for w in s.get('words', []):
            out.append({'w': w['word'].strip(), 't0': round(float(w['start']), 3), 't1': round(float(w['end']), 3)})
    return out


def main():
    args = sys.argv[1:]
    model = 'small.en'
    if '--model' in args:
        i = args.index('--model')
        model = args[i + 1]
        del args[i:i + 2]
    if not args:
        sys.exit(1)

    wav = args[0]
    out = None

    try:
        out = transcribe_faster(wav, model)
    except ImportError:
        try:
            out = transcribe_standard(wav, model)
        except ImportError:
            sys.exit(1)

    if out is not None:
        print(json.dumps(out))
    else:
        sys.exit(1)


if __name__ == '__main__':
    main()
