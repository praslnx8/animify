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
            type: "video",
            loading: true,
            base64: mediaItem.base64
        };
        addMediaItem(videoMediaItem);
        try {
            const apiToken = process.env.NEXT_PUBLIC_EXH_AI_API_TOKEN;
            if (!apiToken) {
                videoMediaItem.loading = false;
                videoMediaItem.error = "API token not set";
                return;
            }
            if (!mediaItem.imageUrl && mediaItem.base64) {
                const uploadedUrl = await uploadBase64Image(mediaItem.base64);
                if (!uploadedUrl) {
                    videoMediaItem.error = "Failed to upload image";
                    videoMediaItem.loading = false;
                    return;
                }
                mediaItem.imageUrl = uploadedUrl;
            }
            if (!mediaItem.imageUrl) {
                videoMediaItem.error = "Image URL is missing";
                videoMediaItem.loading = false;
                return;
            }
            const result = await generateVideo({ image_url: mediaItem.imageUrl, prompt }, apiToken);
            if (result.videoUrl) {
                videoMediaItem.videoUrl = result.videoUrl;
            } else {
                videoMediaItem.error = result.error || "Failed to generate video";
            }
        } catch (err: any) {
            videoMediaItem.error = "Network error";
        } finally {
            videoMediaItem.loading = false;
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
