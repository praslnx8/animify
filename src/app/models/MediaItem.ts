import { MediaType } from "./MediaType";

export interface MediaItem {
    id: string;
    type: MediaType;
    prompt?: string;
    base64?: string;
    imageUrl?: string;
    videoUrl?: string;
    loading?: boolean;
    error?: string;
    hasBase64?: boolean;
}