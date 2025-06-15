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
    const processedParams = {
      ...params,
      identity_image_b64: params.identity_image_b64 ?
        params.identity_image_b64.replace(/[\r\n\t ]+/g, '') :
        undefined
    };

    const res = await fetch("/api/photo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(processedParams),
    });

    let data;
    try {
      data = await res.json();
    } catch (jsonError) {
      console.error('Failed to parse photo API response:', jsonError);
      throw new Error('Could not parse server response');
    }

    if (res.ok && data.image_b64) {
      return { image_b64: data.image_b64 };
    } else {
      console.error('Error from photo API:', res.status, res.statusText, data);
      throw new Error(data.error || `Status: ${res.status} ${res.statusText}. Response: ${JSON.stringify(data)}`);
    }
  } catch (err: any) {
    console.error('Exception in generatePhoto:', err);
    throw new Error(err.message || "Exception occurred while generating photo");
  }
}
