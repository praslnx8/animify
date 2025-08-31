import { NextRequest, NextResponse } from 'next/server';
import { GenerateVideoParams } from '../generateVideo';

export const runtime = 'nodejs';

// Define the shape of the incoming request body
interface VideoRequestBody {
    image_url?: string;
    prompt?: string;
    model_id?: string;
    duration?: number;
    allow_nsfw?: boolean;
    nsfw?: boolean;
}

export async function POST(req: NextRequest) {
    try {
        const body: VideoRequestBody = await req.json();

        let {
            image_url,
            prompt,
            model_id = "ultra",
            duration = 20,
            allow_nsfw = true,
            nsfw = true,
        } = body;

        // ✅ Type check for prompt
        if (typeof prompt !== "string" || prompt.trim().length === 0) {
            return NextResponse.json({ error: "Prompt must be a non-empty string" }, { status: 400 });
        }

        // ✅ Safe usage of includes
        if (prompt.toLowerCase().includes(":pro:")) {
            model_id = "pro";
        }

        // ✅ Validate required parameters
        if (!image_url) {
            return NextResponse.json({ error: "Missing required parameter: image_url" }, { status: 400 });
        }

        const apiToken = process.env.EXH_AI_API_TOKEN;
        if (!apiToken) {
            return NextResponse.json({ error: "API token not configured on server" }, { status: 500 });
        }

        const params: GenerateVideoParams = {
            image_url,
            prompt,
        };

        const randomUserID = Math.floor(1000 + Math.random() * 9000).toString();
        const randomBotID = Math.floor(1000 + Math.random() * 9000).toString();

        const apiPayload = {
            ...params,
            user_id: randomUserID,
            bot_id: randomBotID,
            model_id,
            duration,
            nsfw,
            allow_nsfw,
        };

        const res = await fetch("https://api.exh.ai/chat_media_manager/v2/submit_video_generation_task", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${apiToken}`,
            },
            body: JSON.stringify(apiPayload),
        });

        const data = await res.json();

        if (res.ok && data.media_url) {
            return NextResponse.json({ videoUrl: data.media_url });
        } else {
            console.error("Error response from API:", data);
            return NextResponse.json({ error: data.error || "Response has error" }, { status: res.status || 500 });
        }
    } catch (err: any) {
        console.error("Exception occurred while generating video:", err);
        return NextResponse.json({ error: err.message || "Exception occurred while generating video" }, { status: 500 });
    }
}