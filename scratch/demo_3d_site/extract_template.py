import re
import os

src = os.path.abspath("index.html")
out_dir = os.path.abspath("../../templates/3d-website-static")

os.makedirs(os.path.join(out_dir, "css"), exist_ok=True)
os.makedirs(os.path.join(out_dir, "js"), exist_ok=True)

with open(src, "r", encoding="utf-8") as f:
    content = f.read()

# Phase 1: Modularity (CSS & JS)
styles = re.findall(r'<style>(.*?)</style>', content, re.DOTALL)
css_content = "\n".join(styles)
with open(os.path.join(out_dir, "css", "main.css"), "w", encoding="utf-8") as f:
    f.write(css_content.strip())

scripts = re.findall(r'<script>(.*?)</script>', content, re.DOTALL)
js_content = "\n".join(scripts)
with open(os.path.join(out_dir, "js", "engine.js"), "w", encoding="utf-8") as f:
    f.write(js_content.strip())

def replace_first_and_delete_rest(pattern, replacement, text):
    parts = re.split(pattern, text, flags=re.DOTALL)
    if len(parts) == 1:
        return text
    result = parts[0] + replacement + parts[1]
    for i in range(2, len(parts)):
        result += parts[i]
    return result

html = replace_first_and_delete_rest(r'<style>.*?</style>', '<link rel="stylesheet" href="css/main.css">', content)
html = replace_first_and_delete_rest(r'<script>.*?</script>', '<script src="js/engine.js"></script>', html)

# Phase 2: Configuration Injection script addition
# We inject a small bootstrapper that would load config.json (Conceptual for template)
bootstrapper = """
<script>
  // Template Bootstrapper: Load config.json and populate DOM before initializing Engine
  fetch('config.json')
    .then(res => res.json())
    .then(config => {
       document.title = config.meta.title;
       // We can dynamically populate headers/copy based on data-attributes here in the future
       console.log("Template Config Loaded: ", config.clientName);
    });
</script>
<script src="js/engine.js"></script>
"""
html = html.replace('<script src="js/engine.js"></script>', bootstrapper)

with open(os.path.join(out_dir, "index.html"), "w", encoding="utf-8") as f:
    f.write(html.strip())

# Phase 2: Create config.json stub
config_json = """{
  "clientName": "Master_AG",
  "meta": {
    "title": "Master-AG | The Power of Digital Storytelling",
    "description": "An immersive 3D experience."
  },
  "content": {
    "hero": {
      "headline": "storytelling",
      "subheadline": "Scroll-driven WebGL storytelling."
    }
  },
  "theme": {
    "primaryColor": "#cebdf8",
    "secondaryColor": "#c0d4f5"
  }
}"""
with open(os.path.join(out_dir, "config.json"), "w", encoding="utf-8") as f:
    f.write(config_json)

# Copy Server
shutil_src = os.path.abspath("server.js")
shutil_dst = os.path.join(out_dir, "server.js")
import shutil
shutil.copyfile(shutil_src, shutil_dst)

print("Phase 1 & 2 Execution Successful!")
