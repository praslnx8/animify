export interface GenerateVideoParams {
    image_url: string;
    prompt: string;
}

export interface GenerateVideoResult {
    videoUrl?: string;
    error?: string;
}

export async function generateVideo(params: GenerateVideoParams): Promise<GenerateVideoResult> {
    try {
        const res = await fetch("/api/video", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(params),
        });
        const data = await res.json();

        if (res.ok && data.videoUrl) {
            return { videoUrl: data.videoUrl };
        } else {
            throw new Error(data.error || `Error: ${res.status}`);
        }
    } catch (err: any) {
        throw new Error(err.message || "Exception occurred while generating video");
    }
}
