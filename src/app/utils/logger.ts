const isServer = typeof window === 'undefined';

const getTimestamp = () => {
  return new Date().toISOString();
};

const formatData = (data: any): string => {
  if (!data) return '';
  try {
    return JSON.stringify(data);
  } catch (e) {
    return String(data);
  }
};

export const logger = {
  info: (message: string, data?: any) => {
    if (!isServer) {
      throw new Error('Server-side logger cannot be used in browser');
    }
    console.log(`[${getTimestamp()}] [INFO] ${message}`, data ? formatData(data) : '');
  },
  
  error: (message: string, error?: any) => {
    if (!isServer) {
      throw new Error('Server-side logger cannot be used in browser');
    }
    
    let formattedError = '';
    if (error instanceof Error) {
      formattedError = JSON.stringify({ 
        name: error.name, 
        message: error.message, 
        stack: error.stack 
      });
    } else if (error) {
      formattedError = formatData(error);
    }
    
    console.error(`[${getTimestamp()}] [ERROR] ${message}`, formattedError);
  },
  
  warn: (message: string, data?: any) => {
    if (!isServer) {
      throw new Error('Server-side logger cannot be used in browser');
    }
    console.warn(`[${getTimestamp()}] [WARN] ${message}`, data ? formatData(data) : '');
  },
  
  debug: (message: string, data?: any) => {
    if (!isServer) {
      throw new Error('Server-side logger cannot be used in browser');
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${getTimestamp()}] [DEBUG] ${message}`, data ? formatData(data) : '');
    }
  }
};
