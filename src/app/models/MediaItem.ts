import { MediaType } from "./MediaType";

export interface MediaItem {
    id?: string;
    type: MediaType;
    base64?: string;
    imageUrl?: string;
    videoUrl?: string;
    loading?: boolean;
    error?: string;
}