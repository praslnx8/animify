import { base64ToFile } from "../utils/base64-utils";
import { clientLogger } from "../utils/client-logger";

export async function uploadBase64Image(base64: string): Promise<string | null> {
    try {
        clientLogger.info('Starting base64 image upload');
        const formData = new FormData();
        const file = base64ToFile(base64, "upload.png", "image/png");
        formData.append("image", file);
        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });
        const data = await res.json();
        if (data.imageUrl) {
            clientLogger.info('Base64 image upload successful');
            return data.imageUrl;
        } else {
            clientLogger.error('Base64 image upload failed', { 
                status: res.status, 
                error: data.error 
            });
            return null;
        }
    } catch (err) {
        clientLogger.error('Error uploading base64 image', err);
        return null;
    }
}
