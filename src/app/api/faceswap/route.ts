import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source_image_b64, target_image_b64 } = body;

    if (!source_image_b64 || !target_image_b64) {
      return NextResponse.json(
        { error: "Both source and target images are required" },
        { status: 400 }
      );
    }

    const apiToken = process.env.EXH_AI_API_TOKEN;
    if (!apiToken) {
      return NextResponse.json(
        { error: "API token not configured on server" },
        { status: 500 }
      );
    }

    // Call the external API
    const response = await fetch(
      "https://api.exh.ai/image/v1/generate_faceswap_image",
      {
        method: "POST",
        headers: {
          "authorization": `Bearer ${apiToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          nsfw_policy: "allow",
          source_image_b64,
          target_image_b64,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("API Error:", errorData);
      return NextResponse.json(
        { error: "Face swap API request failed" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Face swap error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
