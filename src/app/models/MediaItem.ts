import { MediaType } from "./MediaType";

export interface MediaItem {
    id: string;
    type: MediaType;
    parent?: MediaItem;
    prompt?: string;
    url?: string;
    loading?: boolean;
    error?: string;

    // Advanced params for transform/animate
    model_name?: string;
    style?: string;
    gender?: string;
    body_type?: string;
    skin_color?: string;
    auto_detect_hair_color?: boolean;
    nsfw_policy?: string;
}