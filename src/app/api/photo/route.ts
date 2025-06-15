import { NextRequest, NextResponse } from 'next/server';
import { GeneratePhotoParams } from '../generatePhoto';

export const runtime = 'nodejs';


function cleanBase64(base64: string): string {
    if (!base64) return '';

    let cleaned = base64.replace(/[\r\n\t ]+/g, '');

    if (cleaned.startsWith('data:')) {
        const match = cleaned.match(/^data:.*;base64,(.*)$/);
        if (match && match[1]) {
            cleaned = match[1];
        }
    }

    return cleaned;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        let { identity_image_b64, prompt, model_name, style, gender, body_type, skin_color, auto_detect_hair_color, nsfw_policy } = body;

        if (!identity_image_b64 || !prompt) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        identity_image_b64 = cleanBase64(identity_image_b64);

        if (!identity_image_b64) {
            return NextResponse.json({ error: 'Invalid base64 image data' }, { status: 400 });
        }

        console.log(`Processing photo generation request with image (${identity_image_b64.length} chars) and prompt: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"`);

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

        try {
            console.log('Sending request to ExH AI API...');

            const res = await fetch("https://api.exh.ai/image/v1/generate_gallery_image", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "accept": "application/json",
                    "authorization": `Bearer ${apiToken}`,
                },
                body: JSON.stringify(apiPayload),
            });

            console.log(`API response status: ${res.status} ${res.statusText}`);

            // Parse the response JSON
            let data;
            try {
                data = await res.json();
            } catch (jsonError) {
                console.error('Failed to parse API response as JSON:', jsonError);
                return NextResponse.json({
                    error: `Failed to parse API response: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`
                }, { status: 502 });
            }

            // Check if we have a valid response with image data
            if (res.ok && data && data.image_b64) {
                console.log(`Successfully received image_b64 data (${data.image_b64.length} chars)`);
                return NextResponse.json({ image_b64: data.image_b64 });
            } else {
                console.error('Error response from API:',
                    res.status, res.statusText,
                    data ? JSON.stringify(data).substring(0, 500) : 'No data');

                return NextResponse.json({
                    error: `Status: ${res.status} ${res.statusText}. Response: ${JSON.stringify(data)}`
                }, { status: res.status || 500 });
            }
        } catch (fetchError) {
            console.error('Network error while calling ExH AI API:', fetchError);
            return NextResponse.json({
                error: `Network error while calling ExH AI API: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`
            }, { status: 503 });
        }
    } catch (err: any) {
        console.error('Error occurred while generating photo:', err);
        return NextResponse.json({
            error: err.message || "Exception occurred while generating photo",
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        }, { status: 500 });
    }
}
