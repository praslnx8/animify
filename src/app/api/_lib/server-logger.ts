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

export const serverLogger = {
  info: (message: string, data?: any) => {
    console.log(`[${getTimestamp()}] [SERVER-INFO] ${message}`, data ? formatData(data) : '');
  },
  
  error: (message: string, error?: any) => {
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
    
    console.error(`[${getTimestamp()}] [SERVER-ERROR] ${message}`, formattedError);
  },
  
  warn: (message: string, data?: any) => {
    console.warn(`[${getTimestamp()}] [SERVER-WARN] ${message}`, data ? formatData(data) : '');
  },
  
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${getTimestamp()}] [SERVER-DEBUG] ${message}`, data ? formatData(data) : '');
    }
  }
};
