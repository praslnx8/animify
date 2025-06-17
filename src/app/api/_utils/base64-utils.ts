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

/**
 * Fetches an image from a URL and converts it to base64
 * @param url The URL of the image to convert
 * @returns Promise resolving to base64 string without the data:image prefix
 */
export async function urlToBase64(url: string): Promise<string> {
  try {
    // Handle URLs that are already base64
    if (url.startsWith('data:image')) {
      return url.split(',')[1];
    }
    
    // Fetch the image
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    // Convert to array buffer then to base64
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer.toString('base64');
  } catch (error) {
    console.error('Error converting URL to base64:', error);
    throw error;
  }
}

/**
 * Saves a base64 image to the filesystem and returns the URL path
 * @param base64Data The base64 string (without data:image prefix)
 * @returns Promise resolving to the URL path of the saved image
 */
export async function saveBase64ToFile(base64Data: string): Promise<string> {
  try {
    // Import fs and path dynamically since they're only available on the server
    const fs = await import('fs/promises');
    const path = await import('path');
    const { v4: uuidv4 } = await import('uuid');
    
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    
    // Generate unique filename
    const filename = `${uuidv4()}.png`;
    const filepath = path.join(uploadDir, filename);
    
    // Write the file
    await fs.writeFile(filepath, Buffer.from(base64Data, 'base64'));
    
    // Return the URL path (just the path, not the full URL)
    return `/uploads/${filename}`;
  } catch (error) {
    console.error('Error saving base64 to file:', error);
    throw error;
  }
}

/**
 * Builds an absolute URL with the host and protocol from the request
 * @param req The Next.js request object
 * @param path The path to build a URL for
 * @returns A fully qualified URL that will be accessible from a third party
 */
export function buildPublicUrl(req: Request, path: string): string {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const protocol = req.headers.get('x-forwarded-proto') || 'http';
  
  if (!host) {
    // If no host is available, return the path as is
    // This should rarely happen in production
    return path;
  }

  // Make sure the path starts with a slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Build and return the absolute URL
  return `${protocol}://${host}${normalizedPath}`;
}
