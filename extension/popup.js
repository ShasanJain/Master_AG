// popup.js - VillageOS Sync UI Controller
document.addEventListener("DOMContentLoaded", async () => {
  const syncBtn = document.getElementById("sync-btn");
  const msgEl = document.getElementById("msg");
  const villageVal = document.getElementById("village-val");
  const coordsVal = document.getElementById("coords-val");

  // Get active browser tab info on load
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url.includes("travian.com")) {
    syncBtn.disabled = true;
    syncBtn.style.background = "#334155";
    syncBtn.style.color = "#94A3B8";
    msgEl.style.color = "#EF4444";
    msgEl.textContent = "Please visit a Travian game page first.";
    return;
  }

  // Pre-fill popup from active tab DOM info via a dry run message
  chrome.tabs.sendMessage(tab.id, { action: "scrapePage" }, (res) => {
    if (res && res.success && res.data) {
      villageVal.textContent = res.data.villageName || "-";
      coordsVal.textContent = res.data.coords || "-";
    }
  });

  // Handle Sync action
  syncBtn.addEventListener("click", () => {
    msgEl.style.color = "#60A5FA";
    msgEl.textContent = "Extracting data...";

    chrome.tabs.sendMessage(tab.id, { action: "scrapePage" }, async (res) => {
      if (!res || !res.success) {
        msgEl.style.color = "#EF4444";
        msgEl.textContent = `Scrape failed: ${res?.error || "Check tab"}`;
        return;
      }

      msgEl.textContent = "Syncing with VillageOS...";
      
      try {
        // Send payload to local dashboard sync API
        const dashboardUrl = "http://localhost:3000/api/villageos/sync";
        const response = await fetch(dashboardUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(res.data)
        });

        const syncRes = await response.json();
        if (response.ok && syncRes.success) {
          msgEl.style.color = "#34D399";
          msgEl.textContent = "Sync completed successfully!";
        } else {
          msgEl.style.color = "#EF4444";
          msgEl.textContent = `Sync failed: ${syncRes.error || "Dashboard error"}`;
        }
      } catch (err) {
        msgEl.style.color = "#EF4444";
        msgEl.textContent = `Cannot reach local dashboard: ${err.message}`;
      }
    });
  });
});
