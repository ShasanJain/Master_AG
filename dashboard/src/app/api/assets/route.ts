import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const brollDir = path.join(process.cwd(), '..', 'assets', 'broll');
    if (!fs.existsSync(brollDir)) {
      return NextResponse.json({ assets: [] });
    }
    
    const files = fs.readdirSync(brollDir);
    const validExtensions = ['.mp4', '.jpg', '.jpeg', '.png'];
    const assets = files
      .filter(file => validExtensions.some(ext => file.toLowerCase().endsWith(ext)))
      .map(file => path.join('..', 'assets', 'broll', file));
      
    return NextResponse.json({ assets });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read assets' }, { status: 500 });
  }
}
