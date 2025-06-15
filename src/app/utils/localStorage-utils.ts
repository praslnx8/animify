import { MediaItem } from "../models/MediaItem";

const STORAGE_KEY = 'animify_media_items';

export const saveMediaItemsToLocalStorage = (mediaItems: MediaItem[]): void => {
  try {
    const storedItems: MediaItem[] = mediaItems.filter(item => item.imageUrl).map(item => {
      if (!item.base64) {
        return { ...item };
      }
      
      const { base64, ...rest } = item;
      return {
        ...rest,
        hasBase64: true
      };
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedItems));
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
