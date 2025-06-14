"use client";

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
import { uploadBase64Image } from "../api/uploadBase64Image";
import { MediaItem } from "../models/MediaItem";
import { MediaType } from "../models/MediaType";

interface PhotoAnimateDialogProps {
    open: boolean;
    onClose: () => void;
    mediaItem: MediaItem;
    addMediaItem: (mediaItem: MediaItem) => void;
    updateMediaItem: (mediaItem: MediaItem) => void;
}

const PhotoAnimateDialog: React.FC<PhotoAnimateDialogProps> = ({ open, onClose, mediaItem, addMediaItem, updateMediaItem }) => {
    const [prompt, setPrompt] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const videoMediaItem: MediaItem = {
            id: Date.now().toString(),
            type: MediaType.Video,
            loading: true,
            base64: mediaItem.base64
        };
        addMediaItem(videoMediaItem);
        try {
            const apiToken = process.env.NEXT_PUBLIC_EXH_AI_API_TOKEN;
            if (!apiToken) {
                updateMediaItem({ ...videoMediaItem, loading: false, error: "API token not set" });
                return;
            }
            if (!mediaItem.imageUrl && mediaItem.base64) {
                const uploadedUrl = await uploadBase64Image(mediaItem.base64);
                if (!uploadedUrl) {
                    updateMediaItem({ ...videoMediaItem, loading: false, error: "Failed to upload image" });
                    return;
                }
                updateMediaItem({ ...mediaItem, imageUrl: uploadedUrl });
                mediaItem.imageUrl = uploadedUrl;
            }
            if (!mediaItem.imageUrl) {
                updateMediaItem({ ...videoMediaItem, loading: false, error: "Image URL is missing" });
                return;
            }
            const result = await generateVideo({ image_url: mediaItem.imageUrl, prompt }, apiToken);
            if (result.videoUrl) {
                setTimeout(() => {
                    updateMediaItem({ ...videoMediaItem, loading: false, videoUrl: result.videoUrl });
                }, 10000);
            } else {
                updateMediaItem({ ...videoMediaItem, loading: false, error: result.error || "Failed to generate video" });
            }
        } catch (err: any) {
            updateMediaItem({ ...videoMediaItem, loading: false, error: "Network error" });
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
