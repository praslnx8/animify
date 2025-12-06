import transformConfig from '../config/transform_config.json';

const TRANSFORM_CONFIG_STORAGE_KEY = 'animify_transform_config';

export interface TransformDefaults {
  convert_prompt: boolean;
  face_swap: boolean;
  model_name: string;
  style: string;
  gender: string;
  body_type: string;
  skin_color: string;
  auto_detect_hair_color: boolean;
  nsfw_policy: string;
}

export class TransformConfigManager {
  private static instance: TransformConfigManager;
  private defaults: TransformDefaults;

  private constructor() {
    this.defaults = transformConfig.defaults as TransformDefaults;
  }

  public static getInstance(): TransformConfigManager {
    if (!TransformConfigManager.instance) {
      TransformConfigManager.instance = new TransformConfigManager();
    }
    return TransformConfigManager.instance;
  }

  public getDefaults(): TransformDefaults {
    return this.defaults;
  }

  public updateDefaults(newDefaults: Partial<TransformDefaults>): void {
    this.defaults = { ...this.defaults, ...newDefaults };
  }

  public resetToDefault(): void {
    this.defaults = transformConfig.defaults as TransformDefaults;
  }

  // Client-side methods for localStorage management
  public loadDefaultsFromLocalStorage(): void {
    if (typeof window !== 'undefined') {
      const storedDefaults = this.getFromLocalStorage(TRANSFORM_CONFIG_STORAGE_KEY);
      if (storedDefaults) {
        try {
          const parsedDefaults = JSON.parse(storedDefaults) as TransformDefaults;
          this.defaults = parsedDefaults;
        } catch (error) {
          console.error('Failed to parse transform config from localStorage:', error);
          // Fall back to default config
          this.defaults = transformConfig.defaults as TransformDefaults;
        }
      }
    }
  }

  public saveDefaultsToLocalStorage(): void {
    if (typeof window !== 'undefined') {
      this.setToLocalStorage(TRANSFORM_CONFIG_STORAGE_KEY, JSON.stringify(this.defaults));
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

  // Static method to get defaults from localStorage (for client-side use)
  public static getDefaultsFromLocalStorage(): TransformDefaults {
    if (typeof localStorage === 'undefined') {
      return transformConfig.defaults as TransformDefaults;
    }

    try {
      const storedDefaults = localStorage.getItem(TRANSFORM_CONFIG_STORAGE_KEY);
      if (storedDefaults) {
        return JSON.parse(storedDefaults) as TransformDefaults;
      }
    } catch (error) {
      console.error('Failed to parse transform config from localStorage:', error);
    }

    return transformConfig.defaults as TransformDefaults;
  }
}
