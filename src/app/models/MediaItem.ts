import { MediaType } from "./MediaType";

export interface MediaItem {
    id: string;
    type: MediaType;
    parent?: MediaItem;
    prompt?: string;
    url?: string;
    loading?: boolean;
    error?: string;
}