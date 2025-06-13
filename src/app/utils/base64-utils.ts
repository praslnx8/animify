/**
 * Converts a File object to a base64 string
 * @param file - The file to convert
 * @returns A Promise that resolves with the base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = base64String.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Converts a base64 string to a File object
 * @param base64 - The base64 string (without data URL prefix)
 * @param filename - The name for the new file
 * @param type - The mime type of the file
 * @returns A new File object
 */
export const base64ToFile = (base64: string, filename: string, type: string = 'image/jpeg'): File => {
  // Create binary data from base64 string
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  // Create Blob and then File from the binary data
  const blob = new Blob([bytes], { type });
  return new File([blob], filename, { type });
};

/**
 * Creates a Data URL from a base64 string
 * @param base64 - The base64 string (without data URL prefix)
 * @param type - The mime type of the data
 * @returns A complete data URL
 */
export const base64ToDataUrl = (base64: string, type: string = 'image/jpeg'): string => {
  return `data:${type};base64,${base64}`;
};
