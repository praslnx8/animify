import { base64ToFile } from "../utils/base64-utils";
import { logger } from "../utils/logger";

export async function uploadBase64Image(base64: string): Promise<string | null> {
    try {
        const formData = new FormData();
        // Use the utility to convert base64 to File
        const file = base64ToFile(base64, "upload.png", "image/png");
        formData.append("image", file);
        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });
        const data = await res.json();
        if (data.imageUrl) {
            logger.info('Base64 image upload successful', { url: data.imageUrl });
            return data.imageUrl;
        } else {
            logger.error('Base64 image upload failed', { 
                status: res.status, 
                error: data.error 
            });
            return null;
        }
    } catch (err) {
        logger.error('Error uploading base64 image', err);
        return null;
    }
}
