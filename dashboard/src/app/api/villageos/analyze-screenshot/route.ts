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

    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    // Convert image to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = imageFile.type || 'image/png';

    // Call Gemini Vision API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          parts: [
            { text: SYSTEM_PROMPT },
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
      return NextResponse.json({ error: `Gemini API error: ${geminiRes.status}`, details: errText }, { status: 500 });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    // Extract JSON from the response (strip markdown fences if present)
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/) 
      || rawText.match(/(\{[\s\S]*\})/);
    
    if (!jsonMatch) {
      return NextResponse.json({ 
        error: 'Could not extract JSON from Gemini response',
        rawText 
      }, { status: 422 });
    }

    const parsed = JSON.parse(jsonMatch[1]);
    return NextResponse.json({ success: true, result: parsed, rawText });

  } catch (error: any) {
    console.error('[VillageOS Screenshot Analyser]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
