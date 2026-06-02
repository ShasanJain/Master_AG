import urllib.request
import os
import sys

URL = "https://huggingface.co/Kijai/WanVideo_comfy/resolve/main/umt5-xxl-enc-fp8_e4m3fn.safetensors?download=true"
OUT_PATH = r"C:\Users\swaya\OneDrive\Desktop\Master_AG\ComfyUI\models\text_encoders\umt5-xxl-enc-fp8_e4m3fn.safetensors"

def reporthook(blocknum, blocksize, totalsize):
    readsofar = blocknum * blocksize
    if totalsize > 0:
        percent = readsofar * 100 / totalsize
        s = "\r%5.1f%% %*d / %d MB" % (
            percent, len(str(totalsize//1024//1024)), readsofar//1024//1024, totalsize//1024//1024)
        sys.stdout.write(s)
        if readsofar >= totalsize:
            sys.stdout.write("\n")
    else:
        sys.stdout.write("read %d\n" % (readsofar,))

if not os.path.exists(OUT_PATH):
    print(f"Downloading UMT5 Text Encoder (approx 4.9 GB)...")
    try:
        urllib.request.urlretrieve(URL, OUT_PATH, reporthook)
        print("Download complete!")
    except Exception as e:
        print(f"Error downloading: {e}")
        if os.path.exists(OUT_PATH):
            os.remove(OUT_PATH)
else:
    print("File already exists!")
