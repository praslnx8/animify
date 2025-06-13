export interface GenerateVideoParams {
  imageUrl: string;
  prompt: string;
}

export interface GenerateVideoResult {
  videoUrl?: string;
  error?: string;
}

export async function generateVideo(
  params: GenerateVideoParams
): Promise<GenerateVideoResult> {
  try {
    const res = await fetch("/api/generate-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
