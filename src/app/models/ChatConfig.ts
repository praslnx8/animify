export interface BotProfile {
  id: string;
  name: string;
  description: string;
  appearance: string;
  pronoun: string;
  example_messages: string[];
}

export interface ChatSettings {
  model_name: string;
  allow_nsfw: boolean;
  tasks: string[];
  enable_memory: boolean;
}

export interface ImageSettings {
  identity_image_url: string;
  model_name: string;
  style: string;
  gender: string;
  skin_color: string;
  allow_nsfw: boolean;
  usage_mode: string;
  return_bs64: boolean;
}

export interface ChatConfig {
  botProfiles: {
    [key: string]: BotProfile;
  };
  chatSettings: {
    [key: string]: ChatSettings;
  };
  imageSettings: {
    [key: string]: ImageSettings;
  };
}
