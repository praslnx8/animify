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
        };

        const res = await fetch("https://api.exh.ai/chatbot/v4/botify/response", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "accept": "*/*",
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
