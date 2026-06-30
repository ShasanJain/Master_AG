import { NextResponse } from 'next/server';
import { createReadStream, statSync, existsSync } from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filePathParam = searchParams.get('path');

  if (!filePathParam) {
    return new NextResponse('Missing path parameter', { status: 400 });
  }

  // Resolve absolute path and ensure it exists
  const absolutePath = path.resolve(filePathParam);
  
  if (!existsSync(absolutePath)) {
    return new NextResponse('Video not found', { status: 404 });
  }

  const stat = statSync(absolutePath);
  const fileSize = stat.size;
  const range = request.headers.get('range');

  if (range) {
    // Handle partial content (video scrubbing/streaming)
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = createReadStream(absolutePath, { start, end });
    
    // We cast file to any here because Next.js NextResponse expects a ReadableStream (Web API), 
    // but createReadStream returns a Node.js ReadStream. It generally works, but to be safe:
    
    const headers = new Headers();
    headers.set('Content-Range', `bytes ${start}-${end}/${fileSize}`);
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Content-Length', chunksize.toString());
    headers.set('Content-Type', 'video/mp4');

    return new NextResponse(file as any, {
      status: 206,
      headers,
    });
  } else {
    // Handle full file load
    const headers = new Headers();
    headers.set('Content-Length', fileSize.toString());
    headers.set('Content-Type', 'video/mp4');
    
    const file = createReadStream(absolutePath);
    return new NextResponse(file as any, {
      status: 200,
      headers,
    });
  }
}
