const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.log(`[BROWSER ERROR] ${err.toString()}`);
  });

  try {
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle0', timeout: 10000 });
    console.log('[SYSTEM] Loaded page successfully.');
  } catch (err) {
    console.error('[SYSTEM] Error loading page:', err);
  }

  await browser.close();
})();
