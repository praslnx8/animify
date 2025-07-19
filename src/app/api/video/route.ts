import { NextRequest, NextResponse } from 'next/server';
import { GenerateVideoParams } from '../generateVideo';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { image_url, prompt, animation_model = "ultra", duration = 10, allow_nsfw = true } = body;

        if (!image_url || !prompt) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        const apiToken = process.env.EXH_AI_API_TOKEN;
        if (!apiToken) {
            return NextResponse.json({ error: 'API token not configured on server' }, { status: 500 });
        }

        const params: GenerateVideoParams = {
            image_url,
            prompt
        };

        const randomUserID = Math.floor(1000 + Math.random() * 9000).toString();
        const randomBotID = Math.floor(1000 + Math.random() * 9000).toString();

        const apiPayload = { ...params, user_id: randomUserID, bot_id: randomBotID, animation_model, duration };
        const res = await fetch("https://api.exh.ai/chat_media_manager/v2/submit_video_generation_task", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${apiToken}`,
            },
            body: JSON.stringify(apiPayload)
        });

        const data = await res.json();
        if (res.ok && data.media_url) {
            return NextResponse.json({ videoUrl: data.media_url });
        } else {
            console.error('Error response from API:', data);
            return NextResponse.json({ error: data.error || "Response has error" }, { status: res.status || 500 });
        }
    } catch (err: any) {
        console.error('Exception occurred while generating video:', err);
        return NextResponse.json({ error: err.message || "Exception occurred while generating video" }, { status: 500 });
    }
}
