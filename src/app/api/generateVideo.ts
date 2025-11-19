import { BotProfile, ChatSettings, ImageSettings } from '../models/ChatConfig';
import chatConfig from '../config/chat_config.json';

export interface GenerateVideoParams {
    image_url: string;
    prompt: string;
}

export interface BotConfig {
    bot_profile: BotProfile;
    user_profile: BotProfile;
    chat_settings: ChatSettings;
    image_settings: ImageSettings;
}

export interface GenerateVideoResult {
    videoUrl?: string;
    error?: string;
}

export async function generateVideo(params: GenerateVideoParams, botConfig?: BotConfig): Promise<GenerateVideoResult> {
    try {
        // Use provided config or load from chat config (using Bot and User profiles)
        let config = botConfig;
        if (!config) {
            config = {
                bot_profile: chatConfig.botProfiles.Bot as BotProfile,
                user_profile: chatConfig.botProfiles.User as BotProfile,
                chat_settings: chatConfig.chatSettings.Bot as ChatSettings,
                image_settings: chatConfig.imageSettings.Bot as ImageSettings
            };
        }

        // Update the identity_image_url in image_settings with the current image being animated
        config = {
            ...config,
            image_settings: {
                ...config.image_settings,
                identity_image_url: params.image_url
            }
        };

        const res = await fetch("/api/video", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ ...params, botConfig: config }),
        });
        const data = await res.json();

        if (res.ok && data.videoUrl) {
            return { videoUrl: data.videoUrl };
        } else {
            throw new Error(data.error || `Error: ${res.status}`);
        }
    } catch (err: any) {
        throw new Error(err.message || "Exception occurred while generating video");
    }
}
