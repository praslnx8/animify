import { NextRequest, NextResponse } from 'next/server';
import { urlToBase64 } from '../_utils/base64-server-utils';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { imageUrl, prompt, gender = 'woman', body_type = 'skinny', skin_color = 'tanned', hair_color = 'black',  animation_model = "pro", duration = 10 } = body;

        if (!imageUrl || !prompt) {
            return NextResponse.json({ error: 'Missing required parameters: imageUrl and prompt are required' }, { status: 400 });
        }

        const apiToken = process.env.EXH_VIDEO_API_TOKEN;
        if (!apiToken) {
            return NextResponse.json({ error: 'API token not configured on server' }, { status: 500 });
        }

        try {
            // Convert image URL to base64
            const image_b64 = await urlToBase64(imageUrl);
            
            // Prepare API request payload
            const apiPayload = {
                gender,
                prompt,
                image_b64,
                body_type,
                skin_color,
                hair_color,
                animation_model,
                duration,
            };
            
            // Make the API call
            const res = await fetch("https://api.exh.ai/animations/v3/animate_story_experimental", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": `Bearer ${apiToken}`,
                },
                body: JSON.stringify(apiPayload)
            });

            const data = await res.json();
            if (res.ok && data.video_url) {
                return NextResponse.json({ videoUrl: data.video_url });
            } else {
                console.error('Error response from API:', data, 'Status:', res.status, 'URL:', res.url);
                return NextResponse.json({ error: data.error || "Response has error" }, { status: res.status || 500 });
            }
        } catch (error: any) {
            console.error('Error processing image:', error);
            return NextResponse.json({ error: error.message || 'Failed to process image' }, { status: 500 });
        }
    } catch (err: any) {
        console.error('Exception occurred while generating animated story:', err);
        return NextResponse.json({ error: err.message || "Exception occurred while generating animated story" }, { status: 500 });
    }
}
