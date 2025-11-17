import { NextRequest, NextResponse } from 'next/server';
import { GenerateVideoParams } from '../generateVideo';

export const runtime = 'nodejs';

async function convertPromptUsingChatbot(userPrompt: string): Promise<string> {
    try {
        const chatbotPayload = {
            context: [
                {
                    image_prompt: null,
                    message: userPrompt,
                    turn: "user"
                }
            ],
            bot_profile: {
                id: "video_prompt_bot",
                description: "I am a video prompt optimizer that converts user descriptions into detailed, effective prompts for video generation",
                appearance: "bot",
                pronoun: "he/him",
                example_messages: [
                    "A man smiling while wearing a red shirt, standing on a sunlit beach with waves in the background"
                ],
                name: "Video Prompt Bot"
            },
            user_profile: {
                id: "video_user",
                name: "User",
                description: "User who wants to get an optimized prompt for video generation",
                appearance: "user",
                pronoun: "they/them"
            },
            chat_settings: {
                model_name: "roleplay",
                allow_nsfw: true,
                tasks: [
                    "Your role is to convert the given user description into an efficient, detailed prompt optimized for video generation. Focus on visual details, actions, camera angles, lighting, and motion. Keep the prompt concise but descriptive."
                ],
                enable_memory: false
            },
            image_settings: {
                model_name: "base",
                style: "realistic",
                gender: "man",
                skin_color: "pale",
                allow_nsfw: true,
                usage_mode: "off",
                return_bs64: false
            }
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
        const { image_url, prompt, model_id = "aura", duration = 10 } = body;

        if (!image_url || !prompt) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        const apiToken = process.env.EXH_AI_API_TOKEN;
        if (!apiToken) {
            return NextResponse.json({ error: 'API token not configured on server' }, { status: 500 });
        }

        // Convert the user prompt to an optimized video prompt using chatbot
        const optimizedPrompt = await convertPromptUsingChatbot(prompt);

        const params: GenerateVideoParams = {
            image_url,
            prompt: optimizedPrompt
        };

        const randomUserID = Math.floor(1000 + Math.random() * 9000).toString();
        const randomBotID = Math.floor(1000 + Math.random() * 9000).toString();

        const apiPayload = { ...params, user_id: randomUserID, bot_id: randomBotID, model_id, duration };
        console.log(apiPayload);
        const res = await fetch("https://api.exh.ai/chat_media_manager/v2/submit_video_generation_task", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${apiToken}`,
            },
            body: JSON.stringify(apiPayload)
        });

        console.log(res);
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
