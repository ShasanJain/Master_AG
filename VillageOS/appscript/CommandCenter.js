/**
 * VillageOS Apps Script Command Center
 * File: appscript/CommandCenter.js
 * 
 * Paste this script in the Extensions > Apps Script editor inside your Google Sheet.
 */

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('VillageOS')
    .addItem('Open AI Command Panel', 'showSidebar')
    .addToUi();
}

/**
 * Renders the sidebar for screenshot paste & upload.
 */
function showSidebar() {
  var html = HtmlService.createHtmlOutput(getSidebarHtml())
      .setTitle('VillageOS Ingestion Control')
      .setWidth(300);
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Receives layout parse data from the sidebar and updates the corresponding sheets.
 */
function updateSheetData(jsonData) {
  var data = JSON.parse(jsonData);
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Update Resources
  if (data.resources) {
    var resSheet = sheet.getSheetByName("03_Resources");
    // Assuming row 4 holds current village data
    resSheet.getRange("B4").setValue(data.resources.wood_current || 0);
    resSheet.getRange("E4").setValue(data.resources.clay_current || 0);
    resSheet.getRange("H4").setValue(data.resources.iron_current || 0);
    resSheet.getRange("K4").setValue(data.resources.crop_current || 0);
  }
  
  // 2. Update Hero RPG Profile
  if (data.hero) {
    var heroSheet = sheet.getSheetByName("04_Hero");
    heroSheet.getRange("B5").setValue(data.hero.level || 1);
    heroSheet.getRange("B6").setValue(data.hero.current_xp || 0);
    heroSheet.getRange("B8").setValue(data.hero.health_pct || 100);
    heroSheet.getRange("B14").setValue(data.hero.status || "Idle");
  }
  
  // 3. Update Village Buildings
  if (data.buildings) {
    var vilSheet = sheet.getSheetByName("02_Village_Data");
    var range = vilSheet.getRange("D4:E10"); // matches Mock building level block
    var values = range.getValues();
    
    for (var i = 0; i < values.length; i++) {
      var buildingName = values[i][0];
      if (data.buildings[buildingName] !== undefined) {
        vilSheet.getRange(4 + i, 5).setValue(data.buildings[buildingName]); // Updates current level (Col E)
      }
    }
  }
  
  // Forces Sheet recalculation
  SpreadsheetApp.flush();
  return "State synchronized. All formulas recalculated successfully.";
}

/**
 * Sidebar HTML template string
 */
function getSidebarHtml() {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <base target="_top">
      <style>
        body { font-family: 'Inter', sans-serif; padding: 15px; background: #F8FAFC; color: #1E293B; margin: 0; }
        .title { font-size: 14px; font-weight: bold; margin-bottom: 10px; color: #1E293B; }
        .upload-zone { border: 2px dashed #E2E8F0; border-radius: 6px; padding: 30px 10px; text-align: center; background: #FFFFFF; cursor: pointer; transition: 0.2s; }
        .upload-zone:hover { border-color: #3B82F6; background: #F1F5F9; }
        .btn { background: #3B82F6; color: white; border: none; padding: 10px; border-radius: 4px; font-weight: bold; cursor: pointer; width: 100%; margin-top: 15px; }
        .btn:hover { background: #2563EB; }
        .status { margin-top: 15px; font-size: 11px; padding: 8px; border-radius: 4px; display: none; }
        .success { background: #D1FAE5; color: #065F46; }
        .info { background: #DBEAFE; color: #1E40AF; }
      </style>
    </head>
    <body>
      <div class="title">Paste or Upload Screenshot</div>
      <div class="upload-zone" id="dropzone">
        <p style="margin: 0; font-size: 12px; color: #64748B;">Paste screenshot directly here (Ctrl+V) or click to choose file</p>
        <input type="file" id="fileInput" style="display:none;" accept="image/*">
      </div>
      <button class="btn" id="parseBtn">Analyze Layout</button>
      <div class="status" id="statusBar"></div>

      <script>
        const dropzone = document.getElementById('dropzone');
        const fileInput = document.getElementById('fileInput');
        const parseBtn = document.getElementById('parseBtn');
        const statusBar = document.getElementById('statusBar');
        let selectedFile = null;

        dropzone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
          if (e.target.files.length > 0) {
            selectedFile = e.target.files[0];
            showStatus('Image selected: ' + selectedFile.name, 'info');
          }
        });

        // Paste event handler (F1 Engineer flow)
        document.addEventListener('paste', (e) => {
          const items = (e.clipboardData || e.originalEvent.clipboardData).items;
          for (let item of items) {
            if (item.type.indexOf("image") === 0) {
              selectedFile = item.getAsFile();
              showStatus('Image pasted from clipboard.', 'info');
            }
          }
        });

        parseBtn.addEventListener('click', () => {
          if (!selectedFile) {
            showStatus('Please select or paste an image first.', 'info');
            return;
          }
          showStatus('Parsing layout coordinates...', 'info');

          // Simulate image-to-JSON parsing response (Layout parser)
          setTimeout(() => {
            const mockParsedData = {
              resources: {
                wood_current: 15400,
                clay_current: 19100,
                iron_current: 9800,
                crop_current: 3100
              },
              hero: {
                level: 7,
                current_xp: 2100,
                health_pct: 92,
                status: "Adventuring"
              },
              buildings: {
                "Woodcutter": 5,
                "Clay Pit": 6,
                "Iron Mine": 5,
                "Cropland": 5
              }
            };

            google.script.run
              .withSuccessHandler((response) => {
                showStatus(response, 'success');
              })
              .withFailureHandler((err) => {
                showStatus('Error: ' + err.message, 'error');
              })
              .updateSheetData(JSON.stringify(mockParsedData));
          }, 1500);
        });

        function showStatus(msg, type) {
          statusBar.style.display = 'block';
          statusBar.className = 'status ' + (type === 'success' ? 'success' : 'info');
          statusBar.innerText = msg;
        }
      </script>
    </body>
  </html>
  `;
}
