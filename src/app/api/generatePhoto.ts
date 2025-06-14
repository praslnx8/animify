import { serverLogger } from './_lib/server-logger';

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

export async function generatePhoto(
  params: GeneratePhotoParams,
  apiToken: string
): Promise<GeneratePhotoResult> {
  try {
    serverLogger.info('Generating photo', { prompt: params.prompt });
    const res = await fetch("https://api.exh.ai/image/v1/generate_gallery_image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
        "authorization": `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        model_name: "base",
        style: "realistic",
        gender: "auto",
        body_type: "auto",
        skin_color: "auto",
        auto_detect_hair_color: true,
        nsfw_policy: "block",
        ...params,
      }),
    });
    const data = await res.json();
    if (res.ok && data.image_b64) {
      serverLogger.info('Photo generation successful');
      return { image_b64: data.image_b64 };
    } else {
      serverLogger.error('Photo generation failed', { 
        status: res.status, 
        statusText: res.statusText,
        error: data.error
      });
      return { error: data.error || "Failed to generate image" };
    }
  } catch (err: any) {
    serverLogger.error('Network error in photo generation', err);
    return { error: "Network error" };
  }
}
