import os
import time
import requests
from pathlib import Path

# Load API Key from environment
MESHY_API_KEY = os.getenv("MESHY_API_KEY")

def generate_3d_mesh(image_url, output_dir="c:/Users/swaya/OneDrive/Desktop/Master_AG/scratch/demo_3d_site/models"):
    """
    Triggers Meshy.ai Image-to-3D generation, polls for completion, 
    and downloads the output GLB mesh locally.
    """
    if not MESHY_API_KEY:
        raise ValueError("MESHY_API_KEY environment variable is not configured.")

    headers = {"Authorization": f"Bearer {MESHY_API_KEY}"}
    payload = {
        "image_url": image_url,
        "enable_pbr": True,  # Generate physics-based rendering texture maps
    }
    
    print(f"Initializing 3D generation task for: {image_url}")
    
    try:
        # Start Task
        response = requests.post(
            "https://api.meshy.ai/v1/image-to-3d", 
            json=payload, 
            headers=headers,
            timeout=10
        )
        response.raise_for_status()
        task_data = response.json()
        task_id = task_data.get("result")
        
        if not task_id:
            raise ValueError(f"Task creation failed. API Response: {task_data}")
            
        print(f"Task created successfully. ID: {task_id}")
        
    except requests.exceptions.RequestException as e:
        print(f"Failed to communicate with Meshy API during initialization: {e}")
        return None

    # Polling Loop: Limit to 24 iterations (2 minutes max)
    max_attempts = 24
    sleep_interval = 5
    glb_url = None
    
    for attempt in range(1, max_attempts + 1):
        print(f"Polling task status (Attempt {attempt}/{max_attempts})...")
        try:
            status_resp = requests.get(
                f"https://api.meshy.ai/v1/image-to-3d/{task_id}", 
                headers=headers,
                timeout=10
            )
            status_resp.raise_for_status()
            data = status_resp.json()
            status = data.get("status")
            
            if status == "SUCCEEDED":
                glb_url = data.get("model_urls", {}).get("glb")
                print("Task completed successfully by API.")
                break
            elif status == "FAILED":
                print(f"Task failed on server. Details: {data.get('task_error')}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"Warning: Network glitch during polling: {e}. Retrying...")
            
        time.sleep(sleep_interval)
        
    if not glb_url:
        print("Error: Polling timed out. Mesh generation took longer than 2 minutes.")
        return None

    # Download GLB Locally
    print(f"Downloading model mesh from: {glb_url}")
    try:
        download_path = Path(output_dir)
        download_path.mkdir(parents=True, exist_ok=True)
        file_path = download_path / f"model_{task_id}.glb"
        
        glb_response = requests.get(glb_url, timeout=30)
        glb_response.raise_for_status()
        
        with open(file_path, "wb") as f:
            f.write(glb_response.content)
            
        print(f"SUCCESS: 3D model saved locally at: {file_path}")
        return str(file_path.as_posix())
        
    except requests.exceptions.RequestException as e:
        print(f"Failed to download or write GLB file: {e}")
        return None

if __name__ == "__main__":
    # Test execution using a sample image url
    test_image = "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF/Duck0.png"
    # To run this in production, make sure to set the environment variable: MESHY_API_KEY
    if MESHY_API_KEY:
        generate_3d_mesh(test_image)
    else:
        print("INFO: Configure MESHY_API_KEY env variable to run the test generator pipeline.")
