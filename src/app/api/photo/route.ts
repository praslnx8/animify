import { NextRequest, NextResponse } from 'next/server';
import { GeneratePhotoParams, GeneratePhotoResult } from '../generatePhoto';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        console.log('[POST /api/photo] Incoming request');
        const body = await req.json();
        console.log('[POST /api/photo] Request body:', body);
        const { identity_image_b64, prompt, model_name, style, gender, body_type, skin_color, auto_detect_hair_color, nsfw_policy } = body;
        
        if (!identity_image_b64 || !prompt) {
            console.warn('[POST /api/photo] Missing required parameters', { identity_image_b64, prompt });
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // Get API token from environment variable (server-side only)
        const apiToken = process.env.EXH_AI_API_TOKEN;
        if (!apiToken) {
            console.error('[POST /api/photo] Missing EXH_AI_API_TOKEN environment variable');
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
        console.log('[POST /api/photo] Params for API call:', params);

        const apiPayload = {
            model_name: "base",
            style: "realistic",
            gender: "auto",
            body_type: "auto",
            skin_color: "auto",
            auto_detect_hair_color: true,
            nsfw_policy: "block",
            ...params,
        };
        console.log('[POST /api/photo] Payload to exh.ai:', apiPayload);

        const res = await fetch("https://api.exh.ai/image/v1/generate_gallery_image", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
                "authorization": `Bearer ${apiToken}`,
            },
            body: JSON.stringify(apiPayload),
        });

        console.log('[POST /api/photo] Response status:', res.status, res.statusText);
        const data = await res.json();
        console.log('[POST /api/photo] Response data:', data);
        if (res.ok && data.image_b64) {
            console.log('[POST /api/photo] Success, returning image_b64');
            return NextResponse.json({ image_b64: data.image_b64 });
        } else {
            console.error('[POST /api/photo] Error response from API:', data);
            return NextResponse.json({ 
                error: `Status: ${res.status} ${res.statusText}. Response: ${JSON.stringify(data)}` 
            }, { status: res.status || 500 });
        }
    } catch (err: any) {
        console.error('[POST /api/photo] Exception:', err);
        return NextResponse.json({ error: err.message || "Exception occurred while generating photo" }, { status: 500 });
    }
}
