import { NextResponse } from 'next/server';

// In-memory sync state to pass content updates from extension directly to active dashboards
let latestData: any = null;

export async function POST(request: Request) {
  try {
    const data = await request.json();
    latestData = data;
    return NextResponse.json({ success: true, message: 'Sync payload queued.', data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function GET() {
  // Let the dashboard poll this endpoint to pull updates in the background
  const data = latestData;
  latestData = null; // Consume
  return NextResponse.json({ success: true, data });
}
