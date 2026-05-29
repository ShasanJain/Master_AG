import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file found' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to the assets/broll directory in the parent folder
    const brollDir = path.join(process.cwd(), '..', 'assets', 'broll');
    
    // Sanitize filename
    const filename = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const filePath = path.join(brollDir, filename);

    await writeFile(filePath, buffer);

    return NextResponse.json({ success: true, message: `File saved to ${filePath}` });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload file' }, { status: 500 });
  }
}
