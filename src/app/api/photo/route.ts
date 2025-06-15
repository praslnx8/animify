import { NextRequest, NextResponse } from 'next/server';
import { GeneratePhotoParams } from '../generatePhoto';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { identity_image_b64, prompt, model_name, style, gender, body_type, skin_color, auto_detect_hair_color, nsfw_policy } = body;

        if (!identity_image_b64 || !prompt) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        const apiToken = process.env.EXH_AI_API_TOKEN;
        if (!apiToken) {
            return NextResponse.json({ error: 'API token not configured on server' }, { status: 500 });
        }

        const params: GeneratePhotoParams = {
            identity_image_b64,
            prompt,
            model_name,
            style,
            gender,
            body_type,
            skin_color,
            auto_detect_hair_color,
            nsfw_policy
        };

        console.log('Generating photo with params:', {
            ...params,
            identity_image_b64: identity_image_b64?.substring(0, 50)
        });

        const res = await fetch("https://api.exh.ai/image/v1/generate_gallery_image", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
                "authorization": `Bearer ${apiToken}`,

            },
            body: JSON.stringify(params),
        });

        const data = await res.json();
        if (res.ok && data.image_b64) {
            return NextResponse.json({ image_b64: data.image_b64 });
        } else {
            console.error('Error response from API:', data);
            return NextResponse.json({
                error: `Status: ${res.status} ${res.statusText}. Response: ${JSON.stringify(data)}`
            }, { status: res.status || 500 });
        }
    } catch (err: any) {
        console.error('Error occurred while generating photo:', err);
        return NextResponse.json({ error: err.message || "Exception occurred while generating photo" }, { status: 500 });
    }
}