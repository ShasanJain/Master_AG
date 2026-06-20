import os
import sys
import argparse
import shutil

def init_site(name, path, template_type, test_mode=False):
    print(f"[*] Initializing 3D storytelling site for: {name}")
    print(f"[*] Path: {path}")
    print(f"[*] Template: {template_type}")

    if test_mode:
        print("[+] Test run completed successfully (dry run).")
        return True

    # Resolve source directories
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    template_src_dir = os.path.join(base_dir, "skills", "3d-websites", "examples")

    if not os.path.exists(template_src_dir):
        print(f"[-] Source template directory not found: {template_src_dir}")
        return False

    # Create destination directory
    try:
        os.makedirs(path, exist_ok=True)
    except Exception as e:
        print(f"[-] Failed to create directory {path}: {e}")
        return False

    if template_type == "static":
        html_src = os.path.join(template_src_dir, "vanilla_storytelling_template.html")
        server_src = os.path.join(template_src_dir, "server.js")
        
        html_dest = os.path.join(path, "index.html")
        server_dest = os.path.join(path, "server.js")

        if not os.path.exists(html_src) or not os.path.exists(server_src):
            print("[-] Static template source files missing.")
            return False

        try:
            shutil.copy(html_src, html_dest)
            shutil.copy(server_src, server_dest)
            print(f"[+] Successfully copied index.html and server.js to {path}")
        except Exception as e:
            print(f"[-] Failed to copy static files: {e}")
            return False

    elif template_type == "modular":
        react_src = os.path.join(template_src_dir, "nextjs_component_template.tsx")
        react_dest = os.path.join(path, "StorytellingCanvas.tsx")

        if not os.path.exists(react_src):
            print("[-] Modular template source files missing.")
            return False

        try:
            shutil.copy(react_src, react_dest)
            print(f"[+] Successfully copied StorytellingCanvas.tsx to {path}")
        except Exception as e:
            print(f"[-] Failed to copy modular files: {e}")
            return False

    print("[+] Scaffolding complete.")
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scaffold a new 3D website client project")
    parser.add_argument("--name", default="Client-Site", help="Client name")
    parser.add_argument("--path", required=True, help="Destination directory path")
    parser.add_argument("--template", choices=["static", "modular"], default="static", help="Template architecture type")
    parser.add_argument("--test", action="store_true", help="Execute in test/dry-run mode")

    args = parser.parse_args()
    
    success = init_site(args.name, args.path, args.template, args.test)
    sys.exit(0 if success else 1)
