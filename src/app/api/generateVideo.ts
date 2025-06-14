export interface GenerateVideoParams {
    image_url: string;
    prompt: string;
}

export interface GenerateVideoResult {
    videoUrl?: string;
    error?: string;
}

export async function generateVideoClient(params: GenerateVideoParams): Promise<GenerateVideoResult> {
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
            return { error: data.error || `Error: ${res.status}` };
        }
    } catch (err: any) {
        return { error: err.message || "Exception occurred while generating video" };
    }
}
