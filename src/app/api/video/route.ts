import { NextRequest, NextResponse } from 'next/server';
import { GenerateVideoParams, BotConfig } from '../generateVideo';

export const runtime = 'nodejs';

async function convertPromptUsingChatbot(userPrompt: string, botConfig: BotConfig): Promise<string> {
    try {
        const chatbotPayload = {
            context: [
                {
                    image_prompt: null,
                    message: userPrompt,
                    turn: "user"
                }
            ],
            bot_profile: botConfig.bot_profile,
            user_profile: botConfig.user_profile,
            chat_settings: botConfig.chat_settings,
            image_settings: botConfig.image_settings
        };

        // Use the internal chatbot route
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/chatbot`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(chatbotPayload),
        });

        const data = await res.json();
        
        if (res.ok && data.response) {
            console.log('Original prompt:', userPrompt);
            console.log('Converted prompt:', data.response);
            return data.response;
        } else {
            console.warn('Failed to convert prompt using chatbot, using original prompt');
            return userPrompt;
        }
    } catch (err) {
        console.error('Error converting prompt:', err);
        return userPrompt; // Fallback to original prompt
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { image_url, prompt, model_id = "aura", duration = 10, botConfig, convertPrompt = true } = body;

        if (!image_url || !prompt) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        if (!botConfig) {
            return NextResponse.json({ error: 'Bot config is required' }, { status: 400 });
        }

        const apiToken = process.env.EXH_AI_API_TOKEN;
        if (!apiToken) {
            return NextResponse.json({ error: 'API token not configured on server' }, { status: 500 });
        }

        // Convert the user prompt to an optimized video prompt using chatbot (if enabled)
        const optimizedPrompt = convertPrompt ? await convertPromptUsingChatbot(prompt, botConfig) : prompt;

        const params: GenerateVideoParams = {
            image_url,
            prompt: optimizedPrompt
        };

        const randomUserID = Math.floor(1000 + Math.random() * 9000).toString();
        const randomBotID = Math.floor(1000 + Math.random() * 9000).toString();

        const apiPayload = { ...params, user_id: randomUserID, bot_id: randomBotID, model_id, duration };
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
            return NextResponse.json({ videoUrl: data.media_url, convertedPrompt: optimizedPrompt });
        } else {
            console.error('Error response from API:', data);
            return NextResponse.json({ error: data.error || "Response has error" }, { status: res.status || 500 });
        }
    } catch (err: any) {
        console.error('Exception occurred while generating video:', err);
        return NextResponse.json({ error: err.message || "Exception occurred while generating video" }, { status: 500 });
    }
}
