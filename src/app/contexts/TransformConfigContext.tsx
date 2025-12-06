'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { TransformConfigManager, TransformDefaults } from '../utils/TransformConfigManager';

interface TransformConfigContextType {
  defaults: TransformDefaults | null;
  updateDefaults: (newDefaults: Partial<TransformDefaults>) => void;
  resetDefaults: () => void;
  saveDefaults: () => void;
  loading: boolean;
}

const TransformConfigContext = createContext<TransformConfigContextType | undefined>(undefined);

export const useTransformConfig = () => {
  const context = useContext(TransformConfigContext);
  if (!context) {
    throw new Error('useTransformConfig must be used within a TransformConfigProvider');
  }
  return context;
};

interface TransformConfigProviderProps {
  children: ReactNode;
}

export const TransformConfigProvider: React.FC<TransformConfigProviderProps> = ({ children }) => {
  const [defaults, setDefaults] = useState<TransformDefaults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load config from localStorage on mount
    const manager = TransformConfigManager.getInstance();
    manager.loadDefaultsFromLocalStorage();
    setDefaults(manager.getDefaults());
    setLoading(false);
  }, []);

  const updateDefaults = (newDefaults: Partial<TransformDefaults>) => {
    const manager = TransformConfigManager.getInstance();
    manager.updateDefaults(newDefaults);
    setDefaults(manager.getDefaults());
  };

  const resetDefaults = () => {
    const manager = TransformConfigManager.getInstance();
    manager.resetToDefault();
    setDefaults(manager.getDefaults());
    manager.saveDefaultsToLocalStorage();
  };

  const saveDefaults = () => {
    const manager = TransformConfigManager.getInstance();
    manager.saveDefaultsToLocalStorage();
  };

  return (
    <TransformConfigContext.Provider
      value={{
        defaults,
        updateDefaults,
        resetDefaults,
        saveDefaults,
        loading,
      }}
    >
      {children}
    </TransformConfigContext.Provider>
  );
};
