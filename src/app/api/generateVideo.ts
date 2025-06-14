import { serverLogger } from './_lib/server-logger';

export interface GenerateVideoParams {
    image_url: string;
    prompt: string;
}

export interface GenerateVideoResult {
    videoUrl?: string;
    error?: string;
}

export async function generateVideo(
    params: GenerateVideoParams,
    apiToken: string
): Promise<GenerateVideoResult> {
    try {
        serverLogger.info('Generating video', { 
            prompt: params.prompt,
            imageUrl: params.image_url 
        });
        
        const res = await fetch("https://api.exh.ai/chat_media_manager/v2/submit_video_generation_task", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${apiToken}`,
            },
            body: JSON.stringify({ ...params, user_id: "1121", bot_id: "1121" })
        });
        const data = await res.json();
        if (res.ok && data.media_url) {
            serverLogger.info('Video generation successful');
            return { videoUrl: data.media_url };
        } else {
            serverLogger.error('Video generation failed', { 
                status: res.status, 
                statusText: res.statusText,
                error: data.error
            });
            return { error: data.error || "Failed to generate video" };
        }
    } catch (err: any) {
        serverLogger.error('Network error in video generation', err);
        return { error: "Network error" };
    }
}
