import os
import wave
import math
import struct

def generate_tone(filename, duration=0.1, freq=440.0, volume=0.5, type='sine'):
    """Generate a simple synthesized sound effect to avoid external dependencies."""
    sample_rate = 44100
    n_samples = int(sample_rate * duration)
    
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        
        for i in range(n_samples):
            t = float(i) / sample_rate
            
            # Simple envelope for a percussive sound
            envelope = math.exp(-t * 15)
            
            if type == 'pop':
                # Frequency sweep down
                f = freq * math.exp(-t * 20)
                value = math.sin(2.0 * math.pi * f * t)
            elif type == 'ding':
                value = math.sin(2.0 * math.pi * freq * t)
                envelope = math.exp(-t * 3) # longer decay
            elif type == 'whoosh':
                # White noise-ish with lowpass (simulated via high freq modulation)
                import random
                value = random.uniform(-1, 1)
                envelope = math.sin(math.pi * (t/duration)) # swell up and down
                
            sample = int(value * envelope * volume * 32767.0)
            # Clamp
            sample = max(-32768, min(32767, sample))
            wav_file.writeframes(struct.pack('<h', sample))

def fetch_sfx():
    sfx_dir = os.path.join(os.path.dirname(__file__), "..", "assets", "sfx")
    os.makedirs(sfx_dir, exist_ok=True)
    
    print("Generating procedural SFX library (API-free)...")
    
    generate_tone(os.path.join(sfx_dir, "pop.wav"), duration=0.15, freq=800, type='pop')
    print("Created pop.wav")
    
    generate_tone(os.path.join(sfx_dir, "ding.wav"), duration=1.0, freq=1200, type='ding')
    print("Created ding.wav")
    
    generate_tone(os.path.join(sfx_dir, "whoosh.wav"), duration=0.8, type='whoosh')
    print("Created whoosh.wav")
    
    print("SFX Library generation complete.")

if __name__ == "__main__":
    fetch_sfx()
