export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      const base64 = base64String.split(',')[1];


      const cleanBase64 = base64?.replace(/[\r\n\t ]+/g, '');

      if (!cleanBase64) {
        reject(new Error('Failed to convert file to base64'));
        return;
      }

      resolve(cleanBase64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export function base64ToBlob(base64: string): Blob {
  if (!base64) {
    throw new Error('Invalid base64 string: empty or undefined');
  }

  let mime = 'image/jpeg';
  let b64 = base64;

  b64 = b64.replace(/[\r\n\t ]+/g, '');

  if (b64.startsWith('data:')) {
    const match = b64.match(/^data:(image\/[^;]+);base64,(.*)$/);
    if (match) {
      mime = match[1];
      b64 = match[2];
    }
  } else {
    try {
      const pngHeader = atob(b64.slice(0, 16));
      if (pngHeader.charCodeAt(0) === 0x89 && pngHeader.charCodeAt(1) === 0x50 && pngHeader.charCodeAt(2) === 0x4E && pngHeader.charCodeAt(3) === 0x47) {
        mime = 'image/png';
      }
    } catch (e) {
      console.warn('Error detecting PNG signature:', e);
    }
  }

  try {
    const byteString = atob(b64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    return new Blob([ab], { type: mime });
  } catch (error) {
    console.error('Error creating blob from base64:', error);
    throw new Error('Failed to convert base64 to blob: ' + (error instanceof Error ? error.message : String(error)));
  }
}


export const base64ToDataUrl = (base64: string, type: string = 'image/jpeg'): string => {
  if (!base64) {
    console.error('Invalid base64 input in base64ToDataUrl');
    return '';
  }

  const cleanBase64 = base64.replace(/[\r\n\t ]+/g, '');

  if (cleanBase64.startsWith('data:')) {
    return cleanBase64;
  }

  return `data:${type};base64,${cleanBase64}`;
};
