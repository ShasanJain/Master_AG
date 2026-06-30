import os
import urllib.request

def fetch_broll():
    broll_dir = os.path.join(os.path.dirname(__file__), "..", "assets", "broll")
    assets_dir = os.path.join(os.path.dirname(__file__), "..", "assets")
    os.makedirs(broll_dir, exist_ok=True)
    
    videos = [
        ("nature_new.mp4", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"),
        ("city_new.mp4", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"),
        ("abstract_new.mp4", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4")
    ]
    
    for filename, url in videos:
        filepath = os.path.join(broll_dir, filename)
        if not os.path.exists(filepath):
            print(f"Downloading {filename}...")
            urllib.request.urlretrieve(url, filepath)
            print(f"Downloaded {filename}.")
        else:
            print(f"{filename} already exists.")
            
    # Download background music
    music_path = os.path.join(assets_dir, "background.mp3")
    if not os.path.exists(music_path):
        print("Downloading background music...")
        music_url = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
        urllib.request.urlretrieve(music_url, music_path)
        print("Background music downloaded.")
    else:
        print("Background music already exists.")

if __name__ == "__main__":
    fetch_broll()
