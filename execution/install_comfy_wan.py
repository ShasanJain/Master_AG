import os
import sys
import subprocess
import venv
import urllib.request
import zipfile
import shutil

COMFY_DIR = os.path.join(os.path.dirname(__file__), "..", "ComfyUI")
VENV_DIR = os.path.join(COMFY_DIR, "venv")
PYTHON_EXE = os.path.join(VENV_DIR, "Scripts", "python.exe") if os.name == 'nt' else os.path.join(VENV_DIR, "bin", "python")

def run_cmd(cmd, cwd=None):
    print(f"\n>>> Running: {cmd}")
    subprocess.run(cmd, shell=True, check=True, cwd=cwd)

def setup_comfyui():
    if not os.path.exists(COMFY_DIR):
        print("[Install] Cloning ComfyUI...")
        run_cmd("git clone https://github.com/comfyanonymous/ComfyUI.git", cwd=os.path.dirname(COMFY_DIR))
    
    if not os.path.exists(VENV_DIR):
        print("[Install] Creating Python venv...")
        venv.create(VENV_DIR, with_pip=True)
    
    print("[Install] Upgrading pip & installing torch (CUDA 12.1)...")
    run_cmd(f"{PYTHON_EXE} -m pip install --upgrade pip")
    run_cmd(f"{PYTHON_EXE} -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121")
    
    print("[Install] Installing ComfyUI requirements...")
    req_file = os.path.join(COMFY_DIR, "requirements.txt")
    run_cmd(f"{PYTHON_EXE} -m pip install -r {req_file}")
    
    # Also install huggingface_hub for model downloading
    run_cmd(f"{PYTHON_EXE} -m pip install huggingface_hub")

def install_custom_nodes():
    custom_nodes_dir = os.path.join(COMFY_DIR, "custom_nodes")
    wan_dir = os.path.join(custom_nodes_dir, "ComfyUI-WanVideoWrapper")
    if not os.path.exists(wan_dir):
        print("[Install] Cloning ComfyUI-WanVideoWrapper...")
        run_cmd("git clone https://github.com/kijai/ComfyUI-WanVideoWrapper.git", cwd=custom_nodes_dir)
        
    req_file = os.path.join(wan_dir, "requirements.txt")
    if os.path.exists(req_file):
        print("[Install] Installing WanVideo requirements...")
        run_cmd(f"{PYTHON_EXE} -m pip install -r {req_file}")

def download_models():
    print("[Install] Downloading Wan2.1 Models (FP8)...")
    # We will use huggingface_hub to download the required models directly into ComfyUI's model directories
    
    dl_script = f"""
from huggingface_hub import hf_hub_download
import os

def dl(repo, filename, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    print(f"Downloading {{filename}} from {{repo}}...")
    hf_hub_download(repo_id=repo, filename=filename, local_dir=out_dir)

comfy_dir = r"{COMFY_DIR}"

# 1. Wan2.1 Diffusion Model (1.3B FP8)
dl("Kijai/WanVideo_comfy", "Wan2_1-T2V-1_3B_fp8_e4m3fn.safetensors", os.path.join(comfy_dir, "models", "diffusion_models"))

# 2. VAE
dl("Kijai/WanVideo_comfy", "Wan2_1_VAE_bf16.safetensors", os.path.join(comfy_dir, "models", "vae"))

# 3. Text Encoders (umt5)
dl("Kijai/WanVideo_comfy", "umt5-xxl-enc-fp8_e4m3fn.safetensors", os.path.join(comfy_dir, "models", "text_encoders"))

print("All models downloaded successfully!")
    """
    
    script_path = os.path.join(COMFY_DIR, "dl_models.py")
    with open(script_path, "w") as f:
        f.write(dl_script)
        
    run_cmd(f"{PYTHON_EXE} {script_path}")

if __name__ == "__main__":
    print("=== ComfyUI & Wan2.1 Installer (Phase 3) ===")
    download_models()
    print("=== Installation Complete ===")
