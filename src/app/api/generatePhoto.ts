export interface GeneratePhotoParams {
  image_url?: string;
  image_base64?: string; // Base64 image data (without data: prefix)
  prompt: string;
  model_name: string;
  style: string;
  gender: string;
  body_type: string;
  skin_color: string;
  auto_detect_hair_color: boolean;
  nsfw_policy: string;
  convert_prompt: boolean;
  // Story mode parameters
  story_mode?: boolean;
  story_step?: number;
  story_total?: number;
  previous_prompts?: string[];
}

export interface GeneratePhotoResult {
  image_url?: string;
  image_base64?: string; // Base64 of generated image for chaining
  converted_prompt?: string;
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

    if (res.ok && data.image_url) {
      return { 
        image_url: data.image_url,
        image_base64: data.image_base64,
        converted_prompt: data.converted_prompt 
      };
    } else {
      throw new Error(data.error || `Status: ${res.status} ${res.statusText}. Response: ${JSON.stringify(data)}`);
    }
  } catch (err: any) {
    throw new Error(err.message || "Exception occurred while generating photo");
  }
}