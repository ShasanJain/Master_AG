import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// ─── Travian page types we can parse from screenshots ───────────────────────
const SYSTEM_PROMPT = `You are a Travian: Legends game screenshot analyser.
Identify what Travian page this screenshot shows, then extract ALL visible data.

Return ONLY valid JSON in this exact structure (omit fields you cannot see):
{
  "pageType": "<one of: home | hero_attributes | hero_inventory | statistics | rally_point | academy | village_overview | map | reports | troops | marketplace | unknown>",
  "confidence": "<high | medium | low>",
  "data": {
    // HOME PAGE (dorf1.php or dorf2.php overview):
    "gold": <number>,
    "silver": <number>,
    "lumber": <number>,
    "clay": <number>,
    "iron": <number>,
    "crop": <number>,
    "warehouseCapacity": <number>,
    "granaryCapacity": <number>,
    "freeCrop": <number>,
    "woodProd": <number>,
    "clayProd": <number>,
    "ironProd": <number>,
    "cropProd": <number>,
    "villageName": "<string>",
    "coords": "<string like (62|-29)>",
    "population": <number>,
    "loyalty": <number>,
    "serverTime": "<string HH:MM:SS>",
    "alliance": "<string>",
    "constructionQueue": "<string describing what is being built>",
    "incomingTroops": "<string>",
    "outgoingTroops": "<string>",

    // HERO ATTRIBUTES PAGE:
    "heroName": "<string>",
    "heroLevel": <number>,
    "heroHealth": <number>,
    "heroSpeed": <number>,
    "heroFightingStrength": <number>,
    "heroExperience": <number>,
    "heroStatus": "<Idle | In combat | Traveling>",
    "heroEquipment": {
      "helmet": "<item name or null>",
      "rightHand": "<item name or null>",
      "leftHand": "<item name or null>",
      "armour": "<item name or null>",
      "shoes": "<item name or null>"
    },

    // HERO INVENTORY PAGE:
    "bagWood": <number>,
    "bagClay": <number>,
    "bagIron": <number>,
    "bagCrop": <number>,
    "consumables": {
      "ointments": <number>,
      "scrolls": <number>,
      "cages": <number>,
      "booksOfWisdom": <number>,
      "artwork": <number>,
      "buckets": <number>
    },

    // STATISTICS PAGE:
    "rank": <number>,
    "totalTroops": <number>,
    "offPoints": <number>,
    "defPoints": <number>,

    // RALLY POINT PAGE:
    "incomingAttacks": [{"coords": "<string>", "arrivesIn": "<string>", "player": "<string>"}],
    "outgoingAttacks": [{"coords": "<string>", "arrivesIn": "<string>", "type": "<attack|raid|reinforce>"}],
    "troopsAtHome": {"<troop_name>": <count>},

    // ACADEMY PAGE:
    "research": {"<troop_or_tech_name>": <level>},

    // VILLAGE OVERVIEW / INFRASTRUCTURE:
    "buildingLevels": {"<building_name>": <level>},

    // MAP PAGE:
    "visibleOases": [{"coords": "<string>", "type": "<Crop+25%|Crop+50%|Wood+25%|Clay+25%|Iron+25%|Wood+25%Crop+25%|Clay+25%Crop+25%|Iron+25%Crop+25%>", "occupied": <bool>}],
    "nearbyVillages": [{"coords": "<string>", "name": "<string>", "player": "<string>"}],

    // BATTLE REPORTS:
    "battleOutcome": "<WON | LOST | BOUNTY>",
    "battleAttacker": "<string>",
    "battleDefender": "<string>",
    "battleCoords": "<string>",
    "battleDate": "<string>",
    "battleLoot": "<string>",
    "attackerLosses": "<string>",
    "defenderLosses": "<string>",

    // TROOPS / BARRACKS PAGE:
    "troopCounts": {"<troop_name>": <count>},
    "troopsInTraining": {"<troop_name>": <count>}
  }
}

Be precise. Extract numbers exactly as shown. For coordinates, preserve the exact format with pipe separator.
If you see a page that doesn't match any type above, use "unknown" and extract whatever data is visible.`;


export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    const targetSlot = formData.get('targetSlot') as string | null;

    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'Gemini API key is not configured in your .env file.', 
        details: 'To use AI Vision, please set GEMINI_API_KEY. Alternatively, copy-paste raw text from the Travian page below and click "Parse Text & Auto-Fill" — it is 100% local, fast, and does not require an API key.' 
      }, { status: 500 });
    }

    // Convert image to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = imageFile.type || 'image/png';

    // Tailor instructions based on the user's selected screenshot slot
    let targetInstructions = '';
    if (targetSlot === 'dorf1') {
      targetInstructions = '\n[TARGET SCREEN: RESOURCE FIELDS / dorf1.php]\nFocus heavily on extracting current wood, clay, iron, crop stocks (Reserves), the warehouse/granary capacities, production rates per hour, gold/silver values, coordinates, and village name.';
    } else if (targetSlot === 'dorf2') {
      targetInstructions = '\n[TARGET SCREEN: VILLAGE CENTER / dorf2.php]\nFocus heavily on extracting building names and their current levels (e.g. Main Building Level 10, Warehouse Level 8, Barracks Level 5).';
    } else if (targetSlot === 'heroAttrs') {
      targetInstructions = '\n[TARGET SCREEN: HERO ATTRIBUTES]\nFocus heavily on extracting the hero name, level, health percentage, experience, fighting strength, and equipped items in slots (helmet, weapon/rightHand, shield/leftHand, armour/body, shoes/boots).';
    } else if (targetSlot === 'heroInv') {
      targetInstructions = '\n[TARGET SCREEN: HERO INVENTORY / CONSUMABLES]\nFocus heavily on extracting quantities of ointments, cages, scrolls, booksOfWisdom, artwork, buckets, and resources in the hero bag (bagWood, bagClay, bagIron, bagCrop).';
    }

    // Call Gemini Vision API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          parts: [
            { text: SYSTEM_PROMPT + targetInstructions },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    };

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return NextResponse.json({ 
        error: `Gemini API returned error code ${geminiRes.status}`, 
        details: 'The AI service is currently unavailable or rate-limited. You can copy-paste raw text from the page instead and click "Parse Text & Auto-Fill" for instant parsing.' 
      }, { status: 500 });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    // Extract JSON from the response (strip markdown fences if present)
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/) 
      || rawText.match(/(\{[\s\S]*\})/);
    
    if (!jsonMatch) {
      return NextResponse.json({ 
        error: 'Could not extract structured data from response',
        rawText 
      }, { status: 422 });
    }

    const parsed = JSON.parse(jsonMatch[1]);
    return NextResponse.json({ success: true, result: parsed, rawText });

  } catch (error: any) {
    console.error('[VillageOS Screenshot Analyser]', error);
    return NextResponse.json({ 
      error: 'Screenshot processing failed.', 
      details: error.message || 'Unknown network error. Use the raw text parser below for guaranteed local parsing.' 
    }, { status: 500 });
  }
}
