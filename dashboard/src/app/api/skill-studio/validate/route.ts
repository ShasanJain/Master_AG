import { NextResponse } from 'next/server';
import { runEngine } from '../engine';
export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  try {
    const { generated, testInput } = await req.json();
    if (!generated) return NextResponse.json({ error: 'Missing generated files' }, { status: 400 });
    const result = await runEngine('validate', { generated, test_input: testInput || '' }, 30000);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
