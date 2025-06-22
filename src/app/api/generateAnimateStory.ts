export interface GenerateAnimateStoryParams {
    imageUrl: string;
    prompt: string;
    gender?: string;
    body_type?: string;
    skin_color?: string;
    hair_color?: string;
}

export interface GenerateAnimateStoryResult {
    videoUrl?: string;
    error?: string;
}

export async function generateAnimateStory(params: GenerateAnimateStoryParams): Promise<GenerateAnimateStoryResult> {
    try {
        const res = await fetch("/api/animate-story", {
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
            console.error('Error response from API:', data);
            throw new Error(data.error || `Error: ${res.status}`);
        }
    } catch (err: any) {
        console.error('Exception occurred while generating animated story:', err);
        throw new Error(err.message || "Exception occurred while generating animated story");
    }
}
