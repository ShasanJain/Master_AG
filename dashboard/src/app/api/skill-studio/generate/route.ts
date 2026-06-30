import { NextResponse } from 'next/server';
import { runEngine } from '../engine';
export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  try {
    const { design, brief } = await req.json();
    if (!design) return NextResponse.json({ error: 'Missing design' }, { status: 400 });
    const result = await runEngine('generate', { design, brief: brief || {} }, 360000);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
