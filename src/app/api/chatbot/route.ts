import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        if (!body.context) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }


        const apiToken = process.env.EXH_AI_API_TOKEN;
        if (!apiToken) {
            return NextResponse.json({ error: 'API token not configured on server' }, { status: 500 });
        }

        const res = await fetch("https://api.exh.ai/chatbot/v3/response", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
                "authorization": `Bearer ${apiToken}`,
            },
            body: JSON.stringify(body),
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
