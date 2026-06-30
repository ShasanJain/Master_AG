import argparse
import os
from moviepy import VideoFileClip, ImageClip
from moviepy.video.fx import Rotate, MultiplyColor

def process_media(file_path, rotate_angle, brightness):
    if not os.path.exists(file_path):
        print(f"Error: File not found {file_path}")
        return

    is_image = file_path.lower().endswith(('.png', '.jpg', '.jpeg'))
    
    # Load clip
    if is_image:
        clip = ImageClip(file_path)
    else:
        clip = VideoFileClip(file_path)

    # Apply Rotation
    if rotate_angle != 0:
        clip = clip.with_effects([Rotate(rotate_angle)])

    # Apply Brightness / Contrast (using MultiplyColor as a simple brightness proxy)
    if brightness != 1.0:
        clip = clip.with_effects([MultiplyColor(brightness)])

    temp_path = file_path + ".temp" + os.path.splitext(file_path)[1]

    # Save
    if is_image:
        clip.save_frame(temp_path, t=0)
    else:
        clip.write_videofile(temp_path, codec="libx264", audio_codec="aac")

    # Close clips
    clip.close()

    # Overwrite original
    os.replace(temp_path, file_path)
    print(f"Successfully processed {file_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", type=str, required=True)
    parser.add_argument("--rotate", type=int, default=0)
    parser.add_argument("--brightness", type=float, default=1.0)
    args = parser.parse_args()

    process_media(args.file, args.rotate, args.brightness)
