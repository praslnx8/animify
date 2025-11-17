import { NextRequest, NextResponse } from 'next/server';
import { buildPublicUrl, saveBase64ToFile, urlToBase64 } from '../_utils/base64-server-utils';

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
                id: "photo_prompt_bot",
                description: "I am a photo prompt optimizer that converts user descriptions into detailed, effective prompts for photo generation",
                appearance: "bot",
                pronoun: "he/him",
                example_messages: [
                    "A professional portrait of a person wearing elegant formal attire, soft studio lighting, shallow depth of field, neutral background"
                ],
                name: "Photo Prompt Bot"
            },
            user_profile: {
                id: "photo_user",
                name: "User",
                description: "User who wants to get an optimized prompt for photo generation",
                appearance: "user",
                pronoun: "they/them"
            },
            chat_settings: {
                model_name: "roleplay",
                allow_nsfw: true,
                tasks: [
                    "Your role is to convert the given user description into an efficient, detailed prompt optimized for photo generation. Focus on visual details, clothing, pose, lighting, composition, and background. Keep the prompt concise but descriptive."
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
        const { image_url, prompt, model_name, style, gender, body_type, skin_color, auto_detect_hair_color, nsfw_policy } = body;

        if (!image_url || !prompt) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        const apiToken = process.env.EXH_AI_API_TOKEN;
        if (!apiToken) {
            return NextResponse.json({ error: 'API token not configured on server' }, { status: 500 });
        }

        // Convert the user prompt to an optimized photo prompt using chatbot
        const optimizedPrompt = await convertPromptUsingChatbot(prompt);

        const identity_image_b64 = await urlToBase64(image_url);

        const params = {
            identity_image_b64,
            prompt: optimizedPrompt,
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
            const imagePath = await saveBase64ToFile(data.image_b64);

            const imageUrl = buildPublicUrl(req, imagePath);

            return NextResponse.json({ image_url: imageUrl });
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