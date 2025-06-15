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

export async function generatePhoto(params: GeneratePhotoParams): Promise<GeneratePhotoResult> {
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
      throw new Error(data.error || `Status: ${res.status} ${res.statusText}. Response: ${JSON.stringify(data)}`);
    }
  } catch (err: any) {
    throw new Error(err.message || "Exception occurred while generating photo");
  }
}