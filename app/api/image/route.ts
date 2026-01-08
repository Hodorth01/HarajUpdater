'use server';

import { NextResponse } from 'next/server';
import { createHarajClient } from '@/lib/harajClient';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const filename = url.searchParams.get('filename'); 
  const size = url.searchParams.get('size') || '140x140';
  const format = url.searchParams.get('format') || 'webp';
  const sessionId = url.searchParams.get('sessionId');

  if (!filename || !sessionId) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  try {
    // Correct pattern: <original_filename>-<size>.<format>
    const cdnUrl = `https://thumbcdn.haraj.com.sa/${filename}-${size}.${format}`;

    // Fetch through your proxy
    const client = createHarajClient(sessionId, false); // false = not GraphQL
    const res = await client.get(cdnUrl, {
      responseType: 'arraybuffer',
    });

    return new NextResponse(res.data, {
      headers: {
        'Content-Type': res.headers['content-type'] || 'image/webp',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (err: any) {
    console.error('Image fetch error:', err.message || err);
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
  }
}
