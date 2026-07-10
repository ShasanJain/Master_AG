# AI Recommendation Engine - VillageOS

## 1 Concept
The VillageOS AI Recommendation Engine evaluates the user's current game state and outputs optimal upgrade priorities, resource balancing strategies, and troop recruitment counts.

## 2 Inputs & Context Payload
The engine parses the following dataset from the sheet:
```json
{
  "tribe": "Romans",
  "server_speed": 3,
  "strategy": "Fast Expansion",
  "villages": [
    {
      "id": 1,
      "is_capital": true,
      "main_building_level": 10,
      "warehouse_capacity": 20000,
      "granary_capacity": 20000,
      "stored_resources": { "wood": 18000, "clay": 19000, "iron": 5000, "crop": 12000 },
      "hourly_production": { "wood": 500, "clay": 500, "iron": 300, "crop": 50 },
      "culture_points_day": 120,
      "active_queue": []
    }
  ]
}
```

## 3 Evaluation Heuristics
1.  **Storage Spill Danger:** If current stored resources plus 1 hour of production exceeds Warehouse/Granary capacity, prioritize storage upgrade or marketplace trade.
2.  **Crop Lock Prevention:** If net crop production is below $+10$ per hour, block all non-crop building requests and enforce Cropland upgrades.
3.  **Expansion Alignment:** If total culture points are within 10% of the next expansion requirement, suggest Town HallSmall Celebration projects.
