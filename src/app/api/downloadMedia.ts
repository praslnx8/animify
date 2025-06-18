
/**
 * Download a media file using the Next.js API proxy to avoid CORS issues.
 * Opens the download in a new tab.
 */
export async function downloadMedia(url: string, id: string, isVideo: boolean) {
  try {
    const proxyUrl = `/api/download?url=${encodeURIComponent(url)}`;
    const a = document.createElement('a');
    a.href = proxyUrl;
    a.download = `media-${id}.${isVideo ? 'mp4' : 'jpg'}`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    alert('Download failed. Please open the media in a new tab and save manually.');
  }
}
