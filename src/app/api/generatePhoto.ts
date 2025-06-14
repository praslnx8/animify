export interface GeneratePhotoParams {
  identity_image_b64: string;
  prompt: string;
  model_name?: string;
  style?: string;
  gender?: string;
  body_type?: string;
  skin_color?: string;
  auto_detect_hair_color?: boolean;
  nsfw_policy?: string;
}

export interface GeneratePhotoResult {
  image_b64?: string;
  error?: string;
}

export async function generatePhotoClient(params: GeneratePhotoParams): Promise<GeneratePhotoResult> {
  try {
    const res = await fetch("/api/photo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    
    if (res.ok && data.image_b64) {
      return { image_b64: data.image_b64 };
    } else {
      return { error: data.error || `Error: ${res.status}` };
    }
  } catch (err: any) {
    return { error: err.message || "Exception occurred while generating photo" };
  }
}
