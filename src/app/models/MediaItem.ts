export interface MediaItem {
    id?: string;
    type: "image" | "video";
    base64?: string;
    imageUrl?: string;
    videoUrl?: string;
    loading?: boolean;
    error?: string;
}