import { NextResponse } from 'next/server';
import { runEngine } from '../engine';
export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  try {
    const { brief } = await req.json();
    if (!brief) return NextResponse.json({ error: 'Missing brief' }, { status: 400 });
    const result = await runEngine('design', { brief }, 90000);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
