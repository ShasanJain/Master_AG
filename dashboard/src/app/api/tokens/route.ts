import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dataPath = path.resolve(process.cwd(), 'data', 'token_usage.json');
    if (!fs.existsSync(dataPath)) {
      return NextResponse.json({ today: [], total: [], history: [] });
    }
    const fileContent = fs.readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(fileContent);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Token API Error:", err);
    return NextResponse.json({ error: 'Failed to fetch token usage.' }, { status: 500 });
  }
}
