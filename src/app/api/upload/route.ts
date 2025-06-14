import fs from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('image');
        if (!file || typeof file === 'string') {
            return NextResponse.json({ error: 'No image uploaded' }, { status: 400 });
        }

        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await fs.mkdir(uploadDir, { recursive: true });

        const ext = (file as File).type.split('/').pop() || 'png';
        const filename = `${uuidv4()}.${ext}`;
        const filepath = path.join(uploadDir, filename);

        const arrayBuffer = await (file as File).arrayBuffer();
        await fs.writeFile(filepath, Buffer.from(arrayBuffer));

        const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
        const protocol = req.headers.get('x-forwarded-proto') || 'http';
        const imageUrl = host
            ? `${protocol}://${host}/uploads/${filename}`
            : `/uploads/${filename}`;
            
        return NextResponse.json({ imageUrl });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }
}
