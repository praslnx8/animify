import { NextRequest, NextResponse } from 'next/server';
import { GenerateVideoParams, GenerateVideoResult } from '../generateVideo';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        console.log('[POST /api/video] Incoming request');
        const body = await req.json();
        console.log('[POST /api/video] Request body:', body);
        const { image_url, prompt } = body;
        
        if (!image_url || !prompt) {
            console.warn('[POST /api/video] Missing required parameters', { image_url, prompt });
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // Get API token from environment variable (server-side only)
        const apiToken = process.env.EXH_AI_API_TOKEN;
        if (!apiToken) {
            console.error('[POST /api/video] Missing EXH_AI_API_TOKEN environment variable');
            return NextResponse.json({ error: 'API token not configured on server' }, { status: 500 });
        }

        const params: GenerateVideoParams = {
            image_url,
            prompt
        };
        console.log('[POST /api/video] Params for API call:', params);

        const apiPayload = { ...params, user_id: "1121", bot_id: "1121" };
        console.log('[POST /api/video] Payload to exh.ai:', apiPayload);

        const res = await fetch("https://api.exh.ai/chat_media_manager/v2/submit_video_generation_task", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${apiToken}`,
            },
            body: JSON.stringify(apiPayload)
        });

        console.log('[POST /api/video] Response status:', res.status, res.statusText);
        const data = await res.json();
        console.log('[POST /api/video] Response data:', data);
        if (res.ok && data.media_url) {
            console.log('[POST /api/video] Success, returning media_url');
            return NextResponse.json({ videoUrl: data.media_url });
        } else {
            console.error('[POST /api/video] Error response from API:', data);
            return NextResponse.json({ 
                error: data.error || "Response has error" 
            }, { status: res.status || 500 });
        }
    } catch (err: any) {
        console.error('[POST /api/video] Exception:', err);
        return NextResponse.json({ error: err.message || "Exception occurred while generating video" }, { status: 500 });
    }
}
