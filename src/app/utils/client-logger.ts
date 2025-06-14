const isBrowser = typeof window !== 'undefined';

const getTimestamp = () => {
  return new Date().toISOString();
};

export const clientLogger = {
  info: (message: string, data?: any) => {
    if (isBrowser) {
      console.log(`[${getTimestamp()}] [CLIENT-INFO] ${message}`, data || '');
    }
  },
  
  error: (message: string, error?: any) => {
    if (isBrowser) {
      console.error(`[${getTimestamp()}] [CLIENT-ERROR] ${message}`, error || '');
    }
  },
  
  warn: (message: string, data?: any) => {
    if (isBrowser) {
      console.warn(`[${getTimestamp()}] [CLIENT-WARN] ${message}`, data || '');
    }
  },
  
  debug: (message: string, data?: any) => {
    if (isBrowser && process.env.NODE_ENV === 'development') {
      console.debug(`[${getTimestamp()}] [CLIENT-DEBUG] ${message}`, data || '');
    }
  }
};
