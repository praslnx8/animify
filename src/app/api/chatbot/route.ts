import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { context, strapi_bot_id, output_audio, enable_proactive_photos } = body;

        if (!context || !strapi_bot_id) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        const apiToken = process.env.EXH_BOTIFY_TOKEN;
        if (!apiToken) {
            return NextResponse.json({ error: 'API token not configured on server' }, { status: 500 });
        }

        const xAuthToken = process.env.X_AUTH_TOKEN;
        if (!xAuthToken) {
            return NextResponse.json({ error: 'X-Auth token not configured on server' }, { status: 500 });
        }


        const params = {
            context: body.context,
            strapi_bot_id,
            output_audio,
            enable_proactive_photos,
            bot_profile: body.bot_profile || {
                id: 'default_bot_id',
                name: 'Default Bot',
                description: 'Default bot description',
                appearance: 'Default appearance',
                pronoun: 'they/them',
                example_messages: ['Hello!']
            },
            user_profile: body.user_profile || {
                id: 'default_user_id',
                name: 'Default User',
                description: 'Default user description',
                appearance: 'Default appearance',
                pronoun: 'they/them',
                example_messages: ['Hi!']
            },
            chat_settings: body.chat_settings || {
                model_name: 'base',
                allow_nsfw: false,
                tasks: [],
                enable_memory: false
            },
            image_settings: body.image_settings || {
                identity_image_url: '',
                model_name: 'base',
                style: 'realistic',
                gender: 'neutral',
                skin_color: 'default',
                allow_nsfw: false,
                usage_mode: 'off',
                return_bs64: false
            }
        };

        const res = await fetch("https://api.exh.ai/chatbot/v3/response", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
                "authorization": `Bearer ${apiToken}`,
                "x-auth-token": xAuthToken
            },
            body: JSON.stringify(params),
        });

        const data = await res.json();
        if (res.ok) {
            return NextResponse.json(data);
        } else {
            console.error('Error response from API:', data);
            return NextResponse.json({
                error: `Status: ${res.status} ${res.statusText}. Response: ${JSON.stringify(data)}`
            }, { status: res.status || 500 });
        }
    } catch (err: any) {
        console.error('Error occurred while fetching chatbot response:', err);
        return NextResponse.json({ error: err.message || "Exception occurred while fetching chatbot response" }, { status: 500 });
    }
}
