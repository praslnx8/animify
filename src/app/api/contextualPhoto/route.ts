import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const apiToken = process.env.EXH_BOTIFY_TOKEN;
        if (!apiToken) {
            return NextResponse.json({ error: 'API token not configured on server' }, { status: 500 });
        }

        const xAuthToken = process.env.X_AUTH_TOKEN;
        if (!xAuthToken) {
            return NextResponse.json({ error: 'X-Auth token not configured on server' }, { status: 500 });
        }

        const response = await fetch('https://api.exh.ai/chatbot/v3/botify/contextual_image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiToken}`,
                'x-auth-token': xAuthToken,
            },
            body: JSON.stringify({
                strapi_bot_id: body.strapi_bot_id,
                user_id: body.user_id,
                context: body.context,
                photo_model_id: 'elite',
            }),
        });

        const data = await response.json();
        if (response.ok) {
            return NextResponse.json(data);
        } else {
            return NextResponse.json({ error: 'Failed to fetch contextual photo', details: data }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'An error occurred', details: (error as Error).message }, { status: 500 });
    }
}
