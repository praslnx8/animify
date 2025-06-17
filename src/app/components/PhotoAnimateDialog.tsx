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
                setTimeout(() => {
                    updateMediaItem({ ...videoMediaItem, loading: false, url: result.videoUrl });
                }, 10000);
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

export default PhotoAnimateDialog;
