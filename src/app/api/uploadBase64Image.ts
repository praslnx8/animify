export async function uploadBase64Image(base64: string): Promise<string | null> {
    try {
        const res = await fetch("/api/upload", {
            method: "POST",
            body: (() => {
                const formData = new FormData();
                const byteString = atob(base64.split(",").pop()!);
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                const blob = new Blob([ab], { type: "image/png" });
                formData.append("image", blob, "upload.png");
                return formData;
            })(),
        });
        const data = await res.json();
        return data.imageUrl || null;
    } catch {
        return null;
    }
}
