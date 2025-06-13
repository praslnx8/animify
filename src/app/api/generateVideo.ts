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
        const res = await fetch("https://api.exh.ai/chat_media_manager/v2/submit_video_generation_task", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "authorization": `Bearer ${apiToken}`,
             },
            body: JSON.stringify(params)
        });
        const data = await res.json();
        if (res.ok && data.videoUrl) {
            return { videoUrl: data.videoUrl };
        } else {
            return { error: data.error || "Failed to generate video" };
        }
    } catch (err: any) {
        return { error: "Network error" };
    }
}
