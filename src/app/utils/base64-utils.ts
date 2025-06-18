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