# Screenshot Recognition - VillageOS

## 1 Purpose
To automate data entry by extracting building levels and resource metrics from screenshot images of the Travian interface.

## 2 Target Crop Layout & Coordinates (1920x1080 Viewport)

### 2.1 Resource Bar (Top-Center Header)
*   **Wood Count:** `[x: 450, y: 15, width: 60, height: 25]`
*   **Clay Count:** `[x: 550, y: 15, width: 60, height: 25]`
*   **Iron Count:** `[x: 650, y: 15, width: 60, height: 25]`
*   **Crop Count:** `[x: 750, y: 15, width: 60, height: 25]`
*   **Warehouse Capacity:** `[x: 820, y: 15, width: 80, height: 25]`
*   **Granary Capacity:** `[x: 910, y: 15, width: 80, height: 25]`

### 2.2 Village Overview (d2) Level Numbers
*   Resource fields are circular slots scattered around the coordinate map.
*   System maps slot IDs ($1$ to $18$) to localized crops. E.g., slot 1 is Woodcutter (top-left), level parsed from the green/brown level circle overlay.

## 3 Image Preprocessing Pipeline
1.  **Scale Normalization:** Resize input images to a default $1920 \times 1080$ resolution.
2.  **Grayscale Filter:** Convert the sub-crops to grayscale.
3.  **Thresholding:** Apply binary thresholding to isolate white text characters against dark green/brown backdrops.
4.  **OCR Processing:** Send clean text sub-crops to the Tesseract engine or Vision API.
