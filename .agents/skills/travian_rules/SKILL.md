---
name: travian-rules
description: Travian Legends game mechanics, coordinates parsing, building slot systems, hero attributes, oases, and formulas for VillageOS.
---

# Travian: Legends Core Rules & Mechanics

This skill provides the permanent logic and structure for parsing, calculation, and UI updates on the Travian VillageOS Dashboard.

## 1. Map Coordinates & Layouts
- **World Format**: Cartesian grid from `(-400|-400)` to `(400|400)`.
- **Directional hyphens**: Travian frequently uses Unicode non-breaking hyphens (`\u2011`) or minus signs (`\u2212`) instead of standard ASCII hyphens (`-`). Normalization MUST clean these to standard hyphens.
- **Village Coordinates**: Displayed in brackets like `(62|-29)` or `(62|−29)`.

## 2. Resource Fields (dorf1.php)
- Standard villages have **18 resource tiles**:
  - Slots `1, 3, 14, 17`: Woodcutters (Lumber)
  - Slots `5, 6, 16, 18`: Clay Pits (Clay)
  - Slots `4, 7, 10, 11`: Iron Mines (Iron)
  - Slots `2, 8, 9, 12, 13, 15`: Croplands (Crop)
- **9-Croppers (9c)**: Have 9 Cropland slots.
- **15-Croppers (15c)**: Have 15 Cropland slots.

## 3. Village Center & Infrastructure (dorf2.php)
- Slots `19` to `40` are urban building slots:
  - Slot `19`: Main Building (always exists)
  - Slot `39`: Rally Point (curved space near bottom right)
  - Slot `40`: Wall (varies by tribe: Earth Wall, Palisade, City Wall, Stone Wall)
  - Other slots can contain Warehouse, Granary, Marketplace, Barracks, Stable, Workshop, Academy, Embassy.

## 4. Hero RPG System
- **RPG Attributes**:
  - Level: Starts at 0, increases with Experience (XP).
  - Health (HP): Max 100%, changes by any value. Manually editable or parsed via OCR.
  - Fighting Strength: Baseline points plus weapon bonuses.
  - Status: Varies between `Idle`, `Adventuring`, `Dead`, `Healing`.
- **Equipment Slots**:
  - Helmet (Head)
  - Right Hand (Weapon)
  - Left Hand (Shield / Map / Torch)
  - Armour (Body)
  - Shoes (Boots)
- **Consumables**: Grouped tier-wise:
  - **Basic**: Ointments (restores 10% health), Cages (captures animals), Buckets (resurrects hero).
  - **Advanced**: Scrolls of Triumph (+Culture Points), Books of Wisdom (resets attributes).
  - **Rare**: Artworks (grant large amount of Culture Points).

## 5. Surrounding Oases & Cropper Scoring
- **Oasis Types**:
  - Single Resource: +25% Wood, Clay, Iron, or Crop.
  - Double Resource: +25% Wood/Crop, +25% Clay/Crop, +25% Iron/Crop, +50% Crop.
- **Cropper Rating**: Rates 9c and 15c villages based on the sum percentage of Crop oases within 7x7 map squares (3 fields distance).

## 6. Parsing Strategy (OCR & Clipboard Text)
- **Strict Headers**: The top lines of a copy-paste usually contain Gold, Silver, and Resource stocks in sequence.
- **Inventory/Trade Items**: Resource counts under "Trade items" represent the resources inside the Hero's bag, followed immediately by consumable counts.

## 7. x_world map.sql — Tile Type Codes (VERIFIED from live server ts31.x3.international.travian.com)

### Travian Legends x3/x5 (ts*.x3.international.travian.com — speed servers)
Auto-detected when NO negative tile types exist in map.sql.
Classification requires BOTH `type` AND `flag` (col 13 = TRUE/FALSE):

| type | flag | Layout |
|------|------|--------|
| 1 | TRUE | **9-Cropper (3,3,3,9)** ← verified (63\|-29) |
| 1 | FALSE | Standard variant |
| 2 | * | Clay/wood-heavy standard |
| 3 | * | Natar standard village |
| 5 | * | **Natar 9-Cropper** (always crop Natar tile) |
| 6 | **TRUE** | **15-Cropper (1,1,1,15)** ← verified (60\|-31) |
| 6 | FALSE | Standard village variant (NOT a cropper) |
| 7 | * | Standard variant |

- Full row schema: `(id, x, y, type, kingdom_id, 'name', player_id, 'player', pop, 'alliance', extra_int, NULL, TRUE/FALSE, NULL, NULL, NULL)`
- **No negative oasis types** — oasis data is not in map.sql on speed servers. Oasis score = N/A.
- `player="Natars"` with `pop=0` = unconquered Natar tile (valid settle target).

### Travian Legends Classic (com/arabics/international non-speed servers)
Auto-detected when negative tile types ARE found in map.sql.
| Type | Meaning |
|------|---------|
| 9 | 9-Cropper |
| 12 | 15-Cropper variant |
| 15 | 15-Cropper |
| < 0 | Oasis tile (see OASIS_BONUS map in find_croppers.py) |
