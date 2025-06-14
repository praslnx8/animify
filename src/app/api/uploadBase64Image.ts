import { base64ToFile } from "../utils/base64-utils";

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
        return data.imageUrl || null;
    } catch {
        return null;
    }
}
