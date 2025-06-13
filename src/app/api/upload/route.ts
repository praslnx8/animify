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

        // Ensure uploads directory exists
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await fs.mkdir(uploadDir, { recursive: true });

        // Generate unique filename
        const ext = (file as File).type.split('/').pop() || 'png';
        const filename = `${uuidv4()}.${ext}`;
        const filepath = path.join(uploadDir, filename);

        // Save file to disk
        const arrayBuffer = await (file as File).arrayBuffer();
        await fs.writeFile(filepath, Buffer.from(arrayBuffer));

        // Public URL
        const imageUrl = `/uploads/${filename}`;
        return NextResponse.json({ imageUrl });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }
}
