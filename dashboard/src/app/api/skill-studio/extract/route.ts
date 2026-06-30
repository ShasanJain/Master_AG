import { NextResponse } from 'next/server';
import { runEngine } from '../engine';
export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  try {
    const { workflow } = await req.json();
    if (!workflow) return NextResponse.json({ error: 'Missing workflow text' }, { status: 400 });
    const result = await runEngine('extract', { workflow }, 90000);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
