---
name: ghost_cms
description: Master_AG skill for interacting with Ghost headless CMS. Enables autonomous creation of blogs, newsletters, and membership sites, as well as programmatic publishing of AI-generated media (LTX-2 videos, ACE-Step audio) directly to the web.
---

# Ghost CMS Skill (Complete Reference)

## ⚙️ 1. Overview
Ghost is a highly-performant, open-source headless CMS built on Node.js. Unlike static site generators, it provides a robust database (SQLite/MySQL), a graphical Admin panel, and comprehensive APIs for headless integrations. 

In the Master_AG ecosystem, Ghost acts as the **Distribution Layer**. When the agent generates an LTX-2 video or an ACE-Step audio track, it uses this skill to autonomously wrap that media in an SEO-optimized article and publish it to the world.

---

## 🛠️ 2. Local Environment Setup & CLI

To orchestrate Ghost locally, use the official `ghost-cli`. Master_AG should execute these via the `run_command` tool when scaffolding a new publication.

### Installation
```bash
npm install -g ghost-cli
```

### Scaffolding a Local Instance
```bash
mkdir my-publication
cd my-publication
ghost install local
```
*Result:* A local SQLite-backed Ghost instance will spin up at `http://localhost:2368`. The Admin panel is available at `http://localhost:2368/ghost`.

### CLI Management Commands
- `ghost start` / `ghost stop` / `ghost restart`
- `ghost log` (View server errors)
- `ghost ls` (List running Ghost instances)

---

## 📡 3. The Admin API (Programmatic Publishing)

The primary way Master_AG interacts with Ghost is via the **Admin API**. This allows the agent to autonomously upload media and publish articles without touching the graphical interface.

**Requirements:**
1. You must create a Custom Integration in the Ghost Admin panel (`Settings -> Integrations`).
2. Extract the `Admin API Key` and `API URL` and store them in the `.env` file as `GHOST_ADMIN_API_KEY` and `GHOST_API_URL`.

### Python Publishing Implementation
To publish content directly from Master_AG's execution Python scripts, use the `requests` library with Ghost's JWT authentication schema:

```python
import os
import requests
import jwt
from datetime import datetime

# 1. Generate JWT Token from the Admin API Key
def get_ghost_token():
    key = os.environ.get('GHOST_ADMIN_API_KEY')
    id, secret = key.split(':')
    iat = int(datetime.now().timestamp())
    header = {'alg': 'HS256', 'typ': 'JWT', 'kid': id}
    payload = {'iat': iat, 'exp': iat + 5 * 60, 'aud': '/admin/'}
    return jwt.encode(payload, bytes.fromhex(secret), algorithm='HS256', headers=header)

# 2. Publish a Post
def publish_post(title, html_content):
    url = f"{os.environ.get('GHOST_API_URL')}/ghost/api/admin/posts/"
    headers = {
        'Authorization': f'Ghost {get_ghost_token()}',
        'Content-Type': 'application/json'
    }
    body = {
        "posts": [{
            "title": title,
            "html": html_content,
            "status": "published" # Use 'draft' to save without publishing
        }]
    }
    res = requests.post(url, json=body, headers=headers)
    return res.json()
```

### Media Uploads (Images/Video)
To upload an AI-generated thumbnail or video to the Ghost CDN before inserting it into a post:
```python
def upload_image(file_path):
    url = f"{os.environ.get('GHOST_API_URL')}/ghost/api/admin/images/upload/"
    headers = {'Authorization': f'Ghost {get_ghost_token()}'}
    files = {'file': (file_path, open(file_path, 'rb'), 'image/png')}
    res = requests.post(url, headers=headers, files=files)
    return res.json()['images'][0]['url']
```

---

## 📖 4. The Content API (Headless Frontends)

If you are using Next.js (like the Master_AG dashboard) to build a custom frontend, use the read-only **Content API**.

1. Install the client: `npm install @tryghost/content-api`
2. Fetch posts in React/Next.js:

```javascript
import GhostContentAPI from '@tryghost/content-api';

const api = new GhostContentAPI({
  url: process.env.GHOST_API_URL,
  key: process.env.GHOST_CONTENT_API_KEY,
  version: "v5.0"
});

// Fetch latest 5 posts
export async function getPosts() {
  return await api.posts.browse({ limit: 5, include: 'tags,authors' });
}
```

---

## 🎨 5. Theme Architecture (Handlebars)

If you are modifying Ghost's native frontend instead of a headless Next.js app, you will edit Handlebars (`.hbs`) files inside `content/themes/`.

- `default.hbs`: The master layout wrap (HTML head, header, footer).
- `index.hbs`: The homepage loop.
- `post.hbs`: The individual article view.
- `package.json`: Contains theme metadata and asset build scripts.

*Rule of thumb:* Never edit the `casper` default theme directly. Always duplicate it, rename it, and upload it as a custom theme.

---

## 🤖 6. Master_AG Autonomous Workflows

By combining Ghost with our existing skills, Master_AG can execute the following industrialized workflows:

1. **The AI Newsletter Pipeline:**
   - Use `search_web` to find trending AI topics.
   - Summarize findings into a markdown article.
   - Call `LTX-2` Generative Video to create a stunning hero background.
   - Upload the video via Ghost Admin API and publish the post directly to Mailgun-subscribed members.

2. **The Passive Audio-Blog:**
   - User inputs a rough draft.
   - Agent refines the text into SEO-optimized copy.
   - Agent uses `ACE-Step` to generate a dramatic background score.
   - Agent uses `ghost-cms` to publish the post with an embedded audio player.
