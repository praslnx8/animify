import { NextRequest, NextResponse } from "next/server";
import { urlToBase64 } from "../_utils/base64-server-utils";

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

    // Parallelize base64 conversions for better performance
    const [sourceB64, targetB64] = await Promise.all([
      urlToBase64(source_image_b64),
      urlToBase64(target_image_b64)
    ]);

    const requestBody = {
      nsfw_policy: "allow",
      source_image_b64: sourceB64,
      target_image_b64: targetB64,
    };

    console.log("Face swap request started");
  

    // Call the external API
    const response = await fetch(
      "https://api.exh.ai/image/v1/generate_faceswap_image",
      {
        method: "POST",
        headers: {
          "authorization": `Bearer ${apiToken}`,
          "accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error("API Error Response:", errorData);
      console.error("Failed request details:", {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      return NextResponse.json(
        { error: "Face swap API request failed" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Success response received");
    console.log("Face swap request completed successfully");
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Face swap error details:", {
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
    return NextResponse.json(
      { error: "Our backend server error" },
      { status: 500 }
    );
  }
}
