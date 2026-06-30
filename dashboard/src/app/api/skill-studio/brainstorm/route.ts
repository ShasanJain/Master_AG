import { NextResponse } from 'next/server';
import { runEngine } from '../engine';
export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  try {
    const { round, brief } = await req.json();
    const result = await runEngine('brainstorm', { round: round || 1, brief: brief || {} }, 30000);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
