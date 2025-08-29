import { ChatConfig } from '../models/ChatConfig';
import defaultChatConfig from '../config/chat_config.json';

const CHAT_CONFIG_STORAGE_KEY = 'animify_chat_config';

export class ChatConfigManager {
  private static instance: ChatConfigManager;
  private config: ChatConfig;

  private constructor() {
    this.config = defaultChatConfig as ChatConfig;
  }

  public static getInstance(): ChatConfigManager {
    if (!ChatConfigManager.instance) {
      ChatConfigManager.instance = new ChatConfigManager();
    }
    return ChatConfigManager.instance;
  }

  public getConfig(): ChatConfig {
    return this.config;
  }

  public updateConfig(newConfig: ChatConfig): void {
    this.config = newConfig;
  }

  public resetToDefault(): void {
    this.config = defaultChatConfig as ChatConfig;
  }

  // Client-side methods for localStorage management
  public loadConfigFromLocalStorage(): void {
    if (typeof window !== 'undefined') {
      const storedConfig = this.getFromLocalStorage(CHAT_CONFIG_STORAGE_KEY);
      if (storedConfig) {
        try {
          const parsedConfig = JSON.parse(storedConfig) as ChatConfig;
          this.config = parsedConfig;
        } catch (error) {
          console.error('Failed to parse chat config from localStorage:', error);
          // Fall back to default config
          this.config = defaultChatConfig as ChatConfig;
        }
      }
    }
  }

  public saveConfigToLocalStorage(): void {
    if (typeof window !== 'undefined') {
      this.setToLocalStorage(CHAT_CONFIG_STORAGE_KEY, JSON.stringify(this.config));
    }
  }

  private getFromLocalStorage(key: string): string | null {
    if (typeof localStorage === 'undefined') return null;
    
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  private setToLocalStorage(key: string, value: string): void {
    if (typeof localStorage === 'undefined') return;
    
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }

  // Static method to get config from localStorage (for client-side use)
  public static getConfigFromLocalStorage(): ChatConfig {
    if (typeof localStorage === 'undefined') {
      return defaultChatConfig as ChatConfig;
    }

    try {
      const storedConfig = localStorage.getItem(CHAT_CONFIG_STORAGE_KEY);
      if (storedConfig) {
        return JSON.parse(storedConfig) as ChatConfig;
      }
    } catch (error) {
      console.error('Failed to parse chat config from localStorage:', error);
    }

    return defaultChatConfig as ChatConfig;
  }
}
