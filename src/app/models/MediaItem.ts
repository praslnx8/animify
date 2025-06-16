import { MediaType } from "./MediaType";

export interface MediaItem {
    id: string;
    type: MediaType;
    prompt?: string;
    imageUrl?: string;
    videoUrl?: string;
    loading?: boolean;
    error?: string;
    parentImageUrl?: string;
    parentPrompt?: string;
}