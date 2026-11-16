import asyncio
import os
import json
import edge_tts

VOICE = 'en-IN-PrabhatNeural'
OUT_DIR = os.path.abspath('pieces/ancient-india-sculpture/voice')
os.makedirs(OUT_DIR, exist_ok=True)

LINES = [
    {
        'id': 'intro',
        'text': 'For four thousand years, the sculptors of ancient India gave stone and bronze the breath of life.',
        'file': 'intro.mp3'
    },
    {
        'id': 'indus',
        'text': 'At Mohenjo-daro, a bronze girl stands in tribhanga grace, adorned with twenty-two bangles.',
        'file': 'indus.mp3'
    },
    {
        'id': 'maurya',
        'text': 'At Sarnath, Emperor Ashoka crowns polished sandstone with four lions and the turning wheel of law.',
        'file': 'maurya.mp3'
    },
    {
        'id': 'gupta',
        'text': 'In the Gupta golden age, stone dissolves into meditation, radiating sublime tranquility.',
        'file': 'gupta.mp3'
    },
    {
        'id': 'elephanta',
        'text': 'Deep inside Elephanta caves, three colossal faces of Shiva gaze across eternity.',
        'file': 'elephanta.mp3'
    },
    {
        'id': 'chola',
        'text': 'Under the Cholas, Nataraja leaps into the ring of fire, dancing creation and cosmic release.',
        'file': 'chola.mp3'
    },
    {
        'id': 'outro',
        'text': 'From sacred earth to the cosmic rhythm, an enduring legacy of divine form.',
        'file': 'outro.mp3'
    }
]

async def main():
    for item in LINES:
        path = os.path.join(OUT_DIR, item['file'])
        comm = edge_tts.Communicate(item['text'], VOICE, rate='-3%', pitch='-1Hz')
        await comm.save(path)
        print(f"Generated {item['file']}")

if __name__ == '__main__':
    asyncio.run(main())
