export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                resolve(reader.result.split(",")[1] || "");
            }
        };
        reader.readAsDataURL(file);
        reader.onerror = (error) => reject(error);
    });
};

export function base64ToBlob(base64: string): Blob {
  if (!base64) {
    throw new Error('Invalid base64 string: empty or undefined');
  }

  let mime = 'image/jpeg';
  let b64 = base64;
  if (b64.startsWith('data:')) {
    const match = b64.match(/^data:(image\/png|image\/jpeg);base64,(.*)$/);
    if (match) {
      mime = match[1];
      b64 = match[2];
    }
  } else {
    // Try to detect PNG by signature (first 8 bytes)
    try {
      const pngHeader = atob(b64.slice(0, 16));
      if (pngHeader.charCodeAt(0) === 0x89 && pngHeader.charCodeAt(1) === 0x50 && pngHeader.charCodeAt(2) === 0x4E && pngHeader.charCodeAt(3) === 0x47) {
        mime = 'image/png';
      }
    } catch { }
  }
  const byteString = atob(b64);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  return new Blob([ab], { type: mime });
}