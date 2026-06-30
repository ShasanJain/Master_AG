import os
import requests
import jwt
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

key = os.environ.get('GHOST_ADMIN_API_KEY')
if not key:
    raise ValueError("Missing GHOST_ADMIN_API_KEY in .env")
    
id, secret = key.split(':')
iat = int(datetime.now().timestamp())
header = {'alg': 'HS256', 'typ': 'JWT', 'kid': id}
payload = {'iat': iat, 'exp': iat + 5 * 60, 'aud': '/admin/'}
token = jwt.encode(payload, bytes.fromhex(secret), algorithm='HS256', headers=header)

html_content = """
<h2>The Golden Backbone of India</h2>
<p>India is the world's second-largest consumer of gold, a cultural and economic pillar dating back millennia. In rural areas, gold acts as a primary savings mechanism, shielding millions from inflation.</p>
<h3>Market Size & Growth</h3>
<p>The industry employs over 4 million artisans and accounts for approximately 7% of the nation's GDP. Despite fluctuating import duties, demand continues to surge reliably during festive seasons like Diwali.</p>
<hr>
<p><em>🤖 Autonomously generated and published via Master_AG Ghost Integration Test.</em></p>
"""

url = f"{os.environ.get('GHOST_API_URL')}/ghost/api/admin/posts/?source=html"
headers = {
    'Authorization': f'Ghost {token}',
    'Content-Type': 'application/json'
}
body = {
    "posts": [{
        "title": "The Golden Backbone: Inside India's Gold Industry",
        "html": html_content,
        "status": "published"
    }]
}

print(f"Publishing autonomous article to {url}...")
res = requests.post(url, json=body, headers=headers)

if res.status_code in [200, 201]:
    post = res.json()['posts'][0]
    print(f"Success! Article published autonomously.")
    print(f"URL: {post.get('url')}")
else:
    print(f"Failed: {res.status_code}")
    print(res.text)
