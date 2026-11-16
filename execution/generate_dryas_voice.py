import asyncio
import os
import edge_tts

VOICE = 'en-US-ChristopherNeural'  # Authoritative, cinematic documentary narrator
OUT_DIR = os.path.abspath('pieces/younger-dryas/voice')
os.makedirs(OUT_DIR, exist_ok=True)

LINES = [
    ('intro.mp3', 'Twelve thousand eight hundred years ago, Earth was thawing from the Ice Age. Suddenly, catastrophe struck.'),
    ('impact.mp3', 'A fragmented comet detonated above the northern ice sheets, igniting continent-spanning firestorms.'),
    ('blackmat.mp3', 'Beneath a dark geological layer of cosmic soot and nanodiamonds, North America\'s giant mammoths vanished forever.'),
    ('megaflood.mp3', 'Collapsing ice dams unleashed catastrophic megafloods into the oceans, shutting down global heat circulation.'),
    ('freeze.mp3', 'The planet plunged into a twelve-hundred-year deep freeze, pushing surviving human tribes to the absolute brink.'),
    ('gobekli.mp3', 'When warmth abruptly returned, survivors gathered at Göbekli Tepe to carve the memory of the comet in megalithic stone.'),
    ('outro.mp3', 'Out of cosmic ashes and catastrophic ice, humanity pivoted to agriculture and the dawn of civilization.')
]

async def main():
    for f, text in LINES:
        comm = edge_tts.Communicate(text, VOICE, rate='+6%', pitch='-1Hz')
        await comm.save(os.path.join(OUT_DIR, f))
        print(f"Generated {f}")

if __name__ == '__main__':
    asyncio.run(main())
