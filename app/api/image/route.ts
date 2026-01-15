import { NextResponse } from 'next/server';
import { createHarajClient } from '@/lib/harajClient';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const filename = searchParams.get('filename');
  const sessionId = searchParams.get('sessionId');
  const size = searchParams.get('size') || '140x140';
  const format = searchParams.get('format') || 'webp';

  if (!filename || !sessionId) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    const cdnUrl = `https://thumbcdn.haraj.com.sa/${filename}-${size}.${format}`;
    const client = createHarajClient(sessionId);

    // Fetch image as buffer
    const res = await client.get(cdnUrl, { responseType: 'arraybuffer' });

    // Add cache-busting headers
    return new NextResponse(res.data, {
      headers: {
        'Content-Type': res.headers['content-type'] ?? `image/${format}`,
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (err: any) {
    console.error('Image fetch error:', err?.message || err);
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
  }
}
