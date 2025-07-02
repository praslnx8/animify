'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ChatConfig } from '../models/ChatConfig';
import { ChatConfigManager } from '../utils/ChatConfigManager';

interface ChatConfigContextType {
  config: ChatConfig | null;
  updateConfig: (newConfig: ChatConfig) => void;
  resetConfig: () => void;
  saveConfig: () => void;
  loading: boolean;
}

const ChatConfigContext = createContext<ChatConfigContextType | undefined>(undefined);

export function ChatConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ChatConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const configManager = ChatConfigManager.getInstance();
    configManager.loadConfigFromLocalStorage();
    setConfig(configManager.getConfig());
    setLoading(false);
  }, []);

  const updateConfig = (newConfig: ChatConfig) => {
    setConfig(newConfig);
    const configManager = ChatConfigManager.getInstance();
    configManager.updateConfig(newConfig);
  };

  const resetConfig = () => {
    const configManager = ChatConfigManager.getInstance();
    configManager.resetToDefault();
    const newConfig = configManager.getConfig();
    setConfig(newConfig);
  };

  const saveConfig = () => {
    if (config) {
      const configManager = ChatConfigManager.getInstance();
      configManager.updateConfig(config);
      configManager.saveConfigToLocalStorage();
    }
  };

  return (
    <ChatConfigContext.Provider value={{
      config,
      updateConfig,
      resetConfig,
      saveConfig,
      loading
    }}>
      {children}
    </ChatConfigContext.Provider>
  );
}

export function useChatConfig() {
  const context = useContext(ChatConfigContext);
  if (context === undefined) {
    throw new Error('useChatConfig must be used within a ChatConfigProvider');
  }
  return context;
}
