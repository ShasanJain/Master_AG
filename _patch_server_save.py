import re

with open('scratch/demo_3d_site/server.js', 'r', encoding='utf-8') as f:
    server_code = f.read()

new_endpoint = """
// Visual Builder Save Endpoint
app.post('/save-dom', express.text({limit: '50mb'}), (req, res) => {
  const htmlContent = req.body;
  if(!htmlContent || !htmlContent.includes('<html')) {
    return res.status(400).send('Invalid HTML payload');
  }
  const fs = require('fs');
  const path = require('path');
  const indexPath = path.join(__dirname, 'index.html');
  
  // Backup before saving
  fs.copyFileSync(indexPath, indexPath + '.bak');
  
  // Overwrite index.html with the new DOM state
  fs.writeFileSync(indexPath, htmlContent, 'utf-8');
  console.log('Visual Builder saved new state to index.html');
  res.send('OK');
});

// Start the server
"""

if '/save-dom' not in server_code:
    server_code = server_code.replace('// Start the server', new_endpoint)
    with open('scratch/demo_3d_site/server.js', 'w', encoding='utf-8') as f:
        f.write(server_code)
    print("server.js updated with /save-dom endpoint.")
else:
    print("server.js already has /save-dom endpoint.")
