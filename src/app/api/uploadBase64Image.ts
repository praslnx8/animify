import { base64ToBlob } from "./_utils/base64-utils";

export async function uploadBase64Image(base64: string): Promise<string> {
    try {
        const formData = new FormData();
        const blob = base64ToBlob(base64);
        const fileExt = blob.type === 'image/png' ? 'png' : 'jpg';
        formData.append('image', blob, `image.${fileExt}`);
        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });
        const data = await res.json();
        if (data.imageUrl) {
            return data.imageUrl;
        } else {
            throw new Error(data.error || "Failed to upload image");
        }
    } catch (err: any) {
        throw new Error(err.message || "Exception occurred while uploading image");
    }
}
