import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField
} from "@mui/material";
import React, { useState } from "react";
import { generateVideo } from "../api/generateVideo";
import { MediaItem } from "../models/MediaItem";
import { MediaType } from "../models/MediaType";

interface PhotoAnimateDialogProps {
  mediaItem: MediaItem;
  open: boolean;
  onClose: () => void;
  addMediaItem: (mediaItem: MediaItem) => void;
  updateMediaItem: (mediaItem: MediaItem) => void;
}

const PhotoAnimateDialog: React.FC<PhotoAnimateDialogProps> = ({ mediaItem, open, onClose, addMediaItem, updateMediaItem }) => {
  const [prompt, setPrompt] = useState(mediaItem.prompt || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const videoMediaItem: MediaItem = {
      id: Date.now().toString(),
      type: MediaType.Video,
      loading: true,
      prompt,
      parent: mediaItem,
    };
    addMediaItem(videoMediaItem);
    try {
      if (!mediaItem.url) {
        updateMediaItem({ ...videoMediaItem, loading: false, error: "Image URL is missing" });
        return;
      }
      const result = await generateVideo({ image_url: mediaItem.url, prompt });
      if (result.videoUrl) {
        updateMediaItem({ ...videoMediaItem, loading: false, url: result.videoUrl });
      } else {
        updateMediaItem({ ...videoMediaItem, loading: false, error: result.error || "Failed to generate video" });
      }
    } catch (err: any) {
      updateMediaItem({ ...videoMediaItem, loading: false, error: err.message || "An error occurred" });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Animate Photo</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              label="Prompt"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              fullWidth
              required
              autoFocus
            />

            {/* Prompt Helper Section */}
            <div style={{ background: '#fafbfc', border: '1px solid #e0e0e0', borderRadius: 12, padding: 16, marginTop: 8 }}>
              <div style={{ marginBottom: 8 }}>
                <strong style={{ color: '#666', fontSize: 13 }}>Prompt Helper</strong>
              </div>
              <div style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>
                For best results, describe the animation you want (e.g. facial expression, gesture, or movement). Example prompts:
              </div>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setPrompt('A 10-second video of a South Indian middle-aged woman wearing a loose cotton floral nighty chatting warmly with a young adult neighbor boy in a t-shirt and lungi inside a modest tiled home. The woman stands near a kitchen counter, handing him a steel plate while smiling. The young man responds politely. The camera slowly pans from left to right, capturing ceiling fans, a wall-mounted calendar, and hanging kitchen utensils. Natural daylight from the window. Realistic, documentary-style, no Western clothing, no luxury interiors.')}
                >
                  Nighty
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setPrompt('A 7-second video of a South Indian woman in her 40s wearing a traditional cotton nighty pointing at a notebook while a young man listens attentively at the dining table. Ceiling fan spinning, TV sound in background. Camera slightly zooms in slowly.')}
                >
                  Study
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setPrompt('Make the person look around curiously')}
                >
                  Look Around
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setPrompt('Make the person nod in agreement')}
                >
                  Nod
                </Button>
              </Stack>
            </div>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={!prompt}>
            {"Animate"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// Utility function for silent photo animate (for retry)
export async function silentPhotoAnimate({
  parentMediaItem,
  prompt,
  addMediaItem,
  updateMediaItem,
}: {
  parentMediaItem: MediaItem;
  prompt: string;
  addMediaItem: (item: MediaItem) => void;
  updateMediaItem: (item: MediaItem) => void;
}) {
  const videoMediaItem: MediaItem = {
    id: Date.now().toString(),
    type: MediaType.Video,
    loading: true,
    prompt,
    parent: parentMediaItem,
  };
  addMediaItem(videoMediaItem);
  try {
    if (!parentMediaItem.url) {
      updateMediaItem({ ...videoMediaItem, loading: false, error: 'Image URL is missing' });
      return;
    }
    const result = await generateVideo({ image_url: parentMediaItem.url, prompt });
    if (result.videoUrl) {
      updateMediaItem({ ...videoMediaItem, loading: false, url: result.videoUrl });
    } else {
      updateMediaItem({ ...videoMediaItem, loading: false, error: result.error || 'Failed to generate video' });
    }
  } catch (err: any) {
    updateMediaItem({ ...videoMediaItem, loading: false, error: err.message || 'An error occurred' });
  }
}

export default PhotoAnimateDialog;
