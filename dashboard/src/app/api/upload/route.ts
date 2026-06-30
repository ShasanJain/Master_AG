import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const type = data.get('type') as string || 'broll';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file found' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to the appropriate assets directory
    const targetFolder = type === 'avatar' ? 'avatars' : 'broll';
    const targetDir = path.join(process.cwd(), '..', 'assets', targetFolder);
    
    // Ensure directory exists
    const fs = await import('fs');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Sanitize filename
    const filename = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const filePath = path.join(targetDir, filename);

    await writeFile(filePath, buffer);

    return NextResponse.json({ success: true, message: `File saved to ${filePath}`, filePath });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload file' }, { status: 500 });
  }
}
