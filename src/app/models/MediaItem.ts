export interface MediaItem {
    type: "image" | "video";
    base64?: string;
    imageUrl?: string;
    videoUrl?: string;
}