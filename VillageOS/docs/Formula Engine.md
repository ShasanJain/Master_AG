# Formula Engine - VillageOS

## 1 Core Mathematical Equations

### 1.1 Building Upgrade Durations
Upgrade time is a function of the building's base level modifier, the target level, the server speed, and the current level of the Main Building.

$$\text{Upgrade Time (seconds)} = \text{ROUND}\left( \frac{\text{Base Time} \times \text{Multiplier}(L)}{\text{Speed}} \times 0.96^{\text{MB Level}} \right)$$

*   Where $\text{Base Time}$ is a building-specific constant (e.g., 300 seconds for Woodcutter level 1).
*   Where $\text{Multiplier}(L)$ is a level-dependent factor defined in the lookup matrices.
*   Where $\text{Speed}$ is the server multiplier ($1$, $2$, $3$, $5$, or $10$).
*   Where $\text{MB Level}$ is the current level of the Main Building ($0$ to $20$).

### 1.2 Resource Production Math
Hourly resource field generation increases by level, further scaled by industry upgrade buildings (Sawmill, Brickyard, Iron Foundry, Flour Mill, Bakery), active oasis bonuses, and the 25% Gold bonus.

$$\text{Net Production} = \text{Base Hourly Rate} \times \left(1 + \sum \text{Oasis Bonuses} + \text{Industry Upgrade \%} + \text{Gold Bonus \%} \right) - \sum \text{Upkeep}$$

*   **Oasis Bonuses:** Sum of connected oases (e.g., $+25\%$ or $+50\%$).
*   **Industry Upgrade \%:** Sawmill/Brickyard/Foundry: $+5\%$ per level (max $+25\%$ at level 5). Flour Mill: $+5\%$ per level (max $+25\%$ at level 5). Bakery: $+5\%$ per level (max $+25\%$ at level 5).
*   **Gold Bonus:** Flat $+25\%$ multiplier.
*   **Upkeep:** Combined crop consumption of existing buildings and troops.

### 1.3 Culture Point Requirements (CP)
Culture points determine available village expansion slots.

$$\text{CP Requirement}(V) = \text{Lookup}(V, \text{Server Speed})$$

For standard speed (x1):
*   Village 2: 2,000 CP
*   Village 3: 8,000 CP
*   Village 4: 20,000 CP
*   Village 5: 39,000 CP

For x3 speed:
*   Village 2: 500 CP
*   Village 3: 2,600 CP
*   Village 4: 6,700 CP
*   Village 5: 12,900 CP
