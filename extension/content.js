// content.js - VillageOS Sync Scraper
console.log("[VillageOS Sync] Loaded and active.");

// Listener for scrape request from Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scrapePage") {
    try {
      const data = extractTravianData();
      sendResponse({ success: true, data });
    } catch (err) {
      sendResponse({ success: false, error: err.message });
    }
  }
  return true;
});

function extractTravianData() {
  const url = window.location.href;
  const payload = {
    url,
    timestamp: new Date().toISOString(),
    villageName: null,
    coords: null,
    resources: {},
    buildings: [],
    hero: {},
    consumables: {}
  };

  // 1. Extract Active Village Info (Header coordinates block)
  try {
    const activeVillageEl = document.querySelector(".villageList .active a, #sidebarBoxVillagelist .active .name, .active .villageName");
    if (activeVillageEl) {
      payload.villageName = activeVillageEl.textContent.trim().replace(/\s*\([\s\S]*$/, "");
    }
  } catch (e) {}
  
  try {
    const coordinateEl = document.querySelector(".villageList .active .coordinates, #sidebarBoxVillagelist .active .coordinates, .active .coordinates");
    if (coordinateEl) {
      const coordsMatch = coordinateEl.textContent.match(/\(([^)]+)\)/) || coordinateEl.textContent.match(/([-−\d]+)\s*\|\s*([-−\d]+)/);
      if (coordsMatch) {
        payload.coords = `(${coordsMatch[1].replace(/\s/g, "")})`;
      }
    }
  } catch (e) {}

  // 2. Extract Stocks & Capacities from Top Header Box
  try {
    const woodStockEl = document.getElementById("l1") || document.querySelector(".stockWood, #valueResource1");
    if (woodStockEl) payload.resources.wood = parseNum(woodStockEl.textContent);
  } catch (e) {}
  
  try {
    const clayStockEl = document.getElementById("l2") || document.querySelector(".stockClay, #valueResource2");
    if (clayStockEl) payload.resources.clay = parseNum(clayStockEl.textContent);
  } catch (e) {}

  try {
    const ironStockEl = document.getElementById("l3") || document.querySelector(".stockIron, #valueResource3");
    if (ironStockEl) payload.resources.iron = parseNum(ironStockEl.textContent);
  } catch (e) {}

  try {
    const cropStockEl = document.getElementById("l4") || document.querySelector(".stockCrop, #valueResource4");
    if (cropStockEl) payload.resources.crop = parseNum(cropStockEl.textContent);
  } catch (e) {}

  try {
    const warehouseCapEl = document.querySelector(".warehouse .value, #valueWarehouse");
    if (warehouseCapEl) payload.resources.warehouseCapacity = parseNum(warehouseCapEl.textContent);
  } catch (e) {}

  try {
    const granaryCapEl = document.querySelector(".granary .value, #valueGranary");
    if (granaryCapEl) payload.resources.granaryCapacity = parseNum(granaryCapEl.textContent);
  } catch (e) {}

  try {
    const goldEl = document.querySelector(".ajaxReplaceGold, .gold, .goldValue");
    if (goldEl) payload.gold = parseNum(goldEl.textContent);
  } catch (e) {}

  try {
    const silverEl = document.querySelector(".ajaxReplaceSilver, .silver, .silverValue");
    if (silverEl) payload.silver = parseNum(silverEl.textContent);
  } catch (e) {}

  // 3. Extract Resource Production rates (dorf1.php)
  try {
    if (url.includes("dorf1.php") || document.getElementById("production") || document.querySelector("#productionTable")) {
      const woodProdEl = document.querySelector("#production .wood .num, #production td.res:nth-child(2), #productionTable .wood .num");
      if (woodProdEl) payload.resources.woodProd = parseNum(woodProdEl.textContent);

      const clayProdEl = document.querySelector("#production .clay .num, #production td.res:nth-child(5), #productionTable .clay .num");
      if (clayProdEl) payload.resources.clayProd = parseNum(clayProdEl.textContent);

      const ironProdEl = document.querySelector("#production .iron .num, #production td.res:nth-child(8), #productionTable .iron .num");
      if (ironProdEl) payload.resources.ironProd = parseNum(ironProdEl.textContent);

      const cropProdEl = document.querySelector("#production .crop .num, #production td.res:nth-child(11), #productionTable .crop .num");
      if (cropProdEl) payload.resources.cropProd = parseNum(cropProdEl.textContent);
    }
  } catch (e) {}

  // 4. Extract Buildings (dorf1 fields or dorf2 center)
  try {
    const resourceFields = document.querySelectorAll("#resourceFieldContainer a.buildingSlot, #rx a.buildingSlot");
    resourceFields.forEach(el => {
      const slotClass = Array.from(el.classList).find(c => c.startsWith("buildingSlot"));
      const slotId = slotClass ? parseInt(slotClass.replace("buildingSlot", "")) : null;
      const levelMatch = el.querySelector(".labelLayer")?.textContent.trim();
      if (slotId && levelMatch) {
        payload.buildings.push({
          slot: slotId,
          level: parseInt(levelMatch),
          category: "resource"
        });
      }
    });
  } catch (e) {}

  try {
    const townSlots = document.querySelectorAll("#villageContent .buildingSlot, #levels .buildingSlot");
    townSlots.forEach(el => {
      const slotId = parseInt(el.getAttribute("data-aid"));
      const aidClass = Array.from(el.classList).find(c => c.startsWith("aid"));
      const slotNum = slotId || (aidClass ? parseInt(aidClass.replace("aid", "")) : null);
      
      const levelLayer = el.querySelector(".labelLayer");
      const level = levelLayer ? parseInt(levelLayer.textContent.trim()) : 0;
      
      const nameAttr = el.getAttribute("title") || el.querySelector("img")?.getAttribute("alt") || "";
      const cleanName = nameAttr.replace(/level\s*\d+/i, "").trim();

      if (slotNum && cleanName) {
        payload.buildings.push({
          slot: slotNum,
          level: level,
          name: cleanName,
          category: "urban"
        });
      }
    });
  } catch (e) {}

  // 5. Extract Hero Stats (if visiting hero.php)
  try {
    if (url.includes("hero.php") || document.querySelector(".heroStatus")) {
      const healthBar = document.querySelector(".heroStatus .health, .health .value");
      if (healthBar) {
        const hpMatch = healthBar.getAttribute("style")?.match(/width:\s*(\d+)%/) || healthBar.textContent.match(/(\d+)\s*%/);
        if (hpMatch) payload.hero.health = parseInt(hpMatch[1]);
      }
      
      const lvlEl = document.querySelector(".heroStatus .level, .heroLevel");
      if (lvlEl) payload.hero.level = parseInt(lvlEl.textContent.replace(/[^\d]/g, ""));

      const nameEl = document.querySelector(".heroStatus .name, .heroName");
      if (nameEl) payload.hero.name = nameEl.textContent.trim();

      const strengthEl = document.querySelector(".attribute.fightingStrength .value, .fightingStrength .value");
      if (strengthEl) payload.hero.fightingStrength = parseNum(strengthEl.textContent);

      const expEl = document.querySelector(".attribute.experience .value, .experience .value");
      if (expEl) payload.hero.experience = parseNum(expEl.textContent);

      const items = document.querySelectorAll(".inventory .item, .inventorySlot .item");
      items.forEach(el => {
        const title = el.getAttribute("title") || el.getAttribute("alt") || "";
        const countEl = el.querySelector(".count");
        const count = countEl ? parseInt(countEl.textContent) : 1;

        if (title.includes("Ointment")) payload.consumables.ointments = count;
        else if (title.includes("Cage")) payload.consumables.cages = count;
        else if (title.includes("Scroll")) payload.consumables.scrolls = count;
        else if (title.includes("Wisdom")) payload.consumables.booksOfWisdom = count;
        else if (title.includes("Artwork")) payload.consumables.artwork = count;
        else if (title.includes("Bucket")) payload.consumables.buckets = count;
      });
    }
  } catch (e) {}

  return payload;
}

// Utility to parse numbers clean of Unicode whitespace, commas, direction tags
function parseNum(str) {
  if (!str) return 0;
  const clean = str.replace(/[\u202a-\u202f\u200e\u200f\s,]/g, "");
  return parseInt(clean) || 0;
}
