import fs from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { buildPublicUrl } from '../../utils/base64-utils';

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

        // Build a publicly accessible URL using our utility function
        const imagePath = `/uploads/${filename}`;
        const imageUrl = buildPublicUrl(req, imagePath);
            
        return NextResponse.json({ imageUrl });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }
}
