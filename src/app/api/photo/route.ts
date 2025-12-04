import { NextRequest, NextResponse } from 'next/server';
import { buildPublicUrl, saveBase64ToFile, urlToBase64 } from '../_utils/base64-server-utils';

export const runtime = 'nodejs';

interface StoryModeParams {
    story_mode: boolean;
    story_step: number;
    story_total: number;
    previous_prompts: string[];
}

async function convertPromptUsingChatbot(userPrompt: string, storyParams?: StoryModeParams): Promise<string> {
    try {
        // Build the task based on whether it's story mode or not
        let task: string;
        let contextMessage: string;

        if (storyParams?.story_mode) {
            const { story_step, story_total, previous_prompts } = storyParams;
            
            // Build context from previous prompts
            const previousContext = previous_prompts.length > 0 
                ? `Previous steps in the story:\n${previous_prompts.map((p, i) => `Step ${i + 1}: ${p}`).join('\n')}\n\n`
                : '';

            task = `You are creating a visual story sequence. This is step ${story_step} of ${story_total}.

${previousContext}Your task is to convert the user's description into a detailed photo prompt for step ${story_step}.

CRITICAL RULES (MUST FOLLOW):
- NEVER modify, describe, or suggest changes to facial features, face shape, or facial identity
- Do NOT include any facial descriptions (eyes, nose, lips, skin tone, face shape) in your output
- The face must remain identical to the source image - only describe body, pose, and scene

STORY GUIDELINES:
- Break down the overall action into this specific step (${story_step}/${story_total})
- Step 1 should show the beginning/preparation of the action
- Middle steps should show progression
- Final step should show the completion/result
- Maintain visual consistency (same person, clothing, setting)
- Focus on the specific moment in the sequence
- Describe pose, hand positions, body language for this exact moment
- Keep the same lighting, background, and style throughout

For example, if the action is "picking up a cup and drinking":
- Step 1/3: Hand reaching toward the cup, looking at cup
- Step 2/3: Hand gripping cup, lifting it toward mouth
- Step 3/3: Cup at lips, drinking pose

Output ONLY the scene/action prompt for step ${story_step} without any facial descriptions.`;

            contextMessage = `Create step ${story_step} of ${story_total} for this action: ${userPrompt}`;
        } else {
            task = "CRITICAL: Do NOT modify, alter, or change any facial features, face shape, skin texture, or facial identity from the original image. Your role is to convert the given user description into a detailed prompt optimized for photo generation. Focus ONLY on: clothing, pose, body position, lighting, composition, background, and setting. The face and facial features must remain exactly as they appear in the source image. Never describe or suggest changes to eyes, nose, lips, face shape, or skin tone. Output ONLY the scene/action description without any facial details.";
            contextMessage = userPrompt;
        }

        const chatbotPayload = {
            context: [
                {
                    image_prompt: null,
                    message: contextMessage,
                    turn: "user"
                }
            ],
            bot_profile: {
                id: "photo_prompt_bot",
                description: storyParams?.story_mode 
                    ? "I am a visual story prompt creator that breaks down actions into sequential photo prompts without changing face details"
                    : "I am a photo prompt optimizer that converts user descriptions into detailed, effective prompts for photo generation without changing face details",
                appearance: "bot",
                pronoun: "she/her",
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
                pronoun: "she/her"
            },
            chat_settings: {
                model_name: "instruct",
                allow_nsfw: true,
                tasks: [task],
                enable_memory: false
            },
            image_settings: {
                model_name: "persona",
                style: "realistic",
                gender: "woman",
                skin_color: "white",
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
        const { 
            image_url, 
            image_base64, // Accept base64 directly for chaining
            prompt, 
            model_name, 
            style, 
            gender, 
            body_type, 
            skin_color, 
            auto_detect_hair_color, 
            nsfw_policy, 
            convert_prompt = true,
            // Story mode parameters
            story_mode = false,
            story_step = 1,
            story_total = 1,
            previous_prompts = [],
            // Face swap parameter
            face_swap = false
        } = body;

        if ((!image_url && !image_base64) || !prompt) {
            return NextResponse.json({ error: 'Missing required parameters (need image_url or image_base64, and prompt)' }, { status: 400 });
        }

        const apiToken = process.env.EXH_AI_API_TOKEN;
        if (!apiToken) {
            return NextResponse.json({ error: 'API token not configured on server' }, { status: 500 });
        }

        // Build story params if in story mode
        const storyParams = story_mode ? {
            story_mode,
            story_step,
            story_total,
            previous_prompts
        } : undefined;

        // Convert the user prompt to an optimized photo prompt using chatbot (if enabled)
        const optimizedPrompt = convert_prompt 
            ? await convertPromptUsingChatbot(prompt, storyParams) 
            : prompt;

        console.log('Story mode:', story_mode, 'Step:', story_step, '/', story_total);
        console.log('Original prompt:', prompt);
        console.log('Optimized prompt:', optimizedPrompt);

        // Use provided base64 or convert from URL
        const identity_image_b64 = image_base64 || await urlToBase64(image_url);

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
            identity_image_b64: identity_image_b64 ? `${identity_image_b64.substring(0, 50)}...${identity_image_b64.substring(identity_image_b64.length - 20)}` : undefined
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
            let finalImageB64 = data.image_b64;
            
            // If face_swap is enabled, swap the face from original image onto the generated result
            if (face_swap) {
                console.log('Face swap enabled, performing face swap...');
                try {
                    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
                    const faceSwapResponse = await fetch(`${baseUrl}/api/faceswap`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            source_image_b64: identity_image_b64, // Original face
                            target_image_b64: data.image_b64, // Generated image to swap face onto
                        }),
                    });
                    
                    const faceSwapData = await faceSwapResponse.json();
                    if (faceSwapResponse.ok && faceSwapData.image_b64) {
                        console.log('Face swap successful');
                        finalImageB64 = faceSwapData.image_b64;
                    } else {
                        console.warn('Face swap failed, using original generated image:', faceSwapData.error);
                    }
                } catch (faceSwapErr) {
                    console.error('Face swap error:', faceSwapErr);
                    // Continue with the original generated image
                }
            }
            
            const imagePath = await saveBase64ToFile(finalImageB64);

            const imageUrl = buildPublicUrl(req, imagePath);

            return NextResponse.json({ 
                image_url: imageUrl,
                image_base64: finalImageB64, // Return base64 for story mode chaining
                converted_prompt: optimizedPrompt // Return the converted prompt for story continuity
            });
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