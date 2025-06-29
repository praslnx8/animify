import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');
    if (!url) {
      return new NextResponse('Missing url parameter', { status: 400 });
    }

    // Fetch the file from the remote or local server
    const fileRes = await fetch(url);
    if (!fileRes.ok) {
      return new NextResponse('Failed to fetch file', { status: 502 });
    }

    // Get content type and disposition
    const contentType = fileRes.headers.get('content-type') || 'application/octet-stream';
    const disposition = fileRes.headers.get('content-disposition') || 'attachment';

    // Stream the file to the client
    const body = fileRes.body;
    const response = new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': disposition,
        'Access-Control-Expose-Headers': 'Content-Disposition',
      },
    });
    return response;
  } catch (error) {
    return new NextResponse('Error downloading file', { status: 500 });
  }
}
