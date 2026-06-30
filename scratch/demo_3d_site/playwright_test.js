const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.error('[PAGE ERROR]', err);
  });

  await page.goto('http://localhost:8080/');
  await page.waitForTimeout(3000);

  const sceneState = await page.evaluate(() => {
    if (typeof scene === 'undefined') return { error: 'scene is undefined' };
    return {
      sceneChildren: scene.children.length,
      cameraPos: camera.position,
      crystalPos: crystalGroup ? crystalGroup.position : null,
      crystalScale: crystalGroup ? crystalGroup.scale : null,
      targetPos: targetPos,
      targetScale: targetScale,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      canvasChildren: document.getElementById('canvas').children.length
    };
  });

  console.log('[SCENE STATE]', JSON.stringify(sceneState, null, 2));

  await browser.close();
})();
