import { MediaItem } from "../models/MediaItem";
import { ChatConfig } from "../models/ChatConfig";

const STORAGE_KEY = 'animify_media_items';
const CHAT_CONFIG_STORAGE_KEY = 'animify_chat_config';

export const saveMediaItemsToLocalStorage = (mediaItems: MediaItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mediaItems));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

export const loadMediaItemsFromLocalStorage = (): MediaItem[] => {
  try {
    const storedItems = localStorage.getItem(STORAGE_KEY);
    if (storedItems) {
      return JSON.parse(storedItems) as MediaItem[];
    }
  } catch (error) {
    console.error("Error loading from localStorage:", error);
  }
  return [];
};

export const clearMediaItemsFromLocalStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing localStorage:", error);
  }
};

// Chat Config utilities
export const saveChatConfigToLocalStorage = (config: ChatConfig): void => {
  try {
    localStorage.setItem(CHAT_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Error saving chat config to localStorage:", error);
  }
};

export const loadChatConfigFromLocalStorage = (): ChatConfig | null => {
  try {
    const storedConfig = localStorage.getItem(CHAT_CONFIG_STORAGE_KEY);
    if (storedConfig) {
      return JSON.parse(storedConfig) as ChatConfig;
    }
  } catch (error) {
    console.error("Error loading chat config from localStorage:", error);
  }
  return null;
};

export const clearChatConfigFromLocalStorage = (): void => {
  try {
    localStorage.removeItem(CHAT_CONFIG_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing chat config from localStorage:", error);
  }
};
