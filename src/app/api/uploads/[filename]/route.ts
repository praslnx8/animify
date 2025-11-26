import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await params;
        
        // Validate filename to prevent directory traversal attacks
        if (!filename || filename.includes('..') || filename.includes('/')) {
            return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
        }

        // Files are stored in uploads/ at project root (outside public for production compatibility)
        const uploadDir = path.join(process.cwd(), 'uploads');
        const filepath = path.join(uploadDir, filename);

        // Check if file exists
        try {
            await fs.access(filepath);
        } catch {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        // Read the file
        const fileBuffer = await fs.readFile(filepath);

        // Determine content type from file extension
        const ext = path.extname(filename).toLowerCase();
        const contentTypeMap: Record<string, string> = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml',
        };
        const contentType = contentTypeMap[ext] || 'application/octet-stream';

        // Return the file with appropriate headers
        return new NextResponse(fileBuffer as unknown as BodyInit, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('Error serving uploaded file:', error);
        return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 });
    }
}
