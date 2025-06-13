"use client";

import {
    Button,
    CircularProgress,
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
    onSuccess: (videoUrl: string) => void;
}

const PhotoAnimateDialog: React.FC<PhotoAnimateDialogProps> = ({ open, onClose, mediaItem, onSuccess }) => {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (!mediaItem.imageUrl && mediaItem.base64) {
                const uploadedUrl = await uploadBase64Image(mediaItem.base64);
                if (!uploadedUrl) {
                    setError("Failed to upload image");
                    setLoading(false);
                    return;
                }
                mediaItem.imageUrl = uploadedUrl;
            }
            if (!mediaItem.imageUrl) {
                setError("Image URL is missing");
                setLoading(false);
                return;
            }
            const result = await generateVideo({ imageUrl: mediaItem.imageUrl, prompt });
            if (result.videoUrl) {
                onSuccess(result.videoUrl);
                setPrompt("");
            } else {
                setError(result.error || "Failed to generate video");
            }
        } catch (err: any) {
            setError("Network error");
        } finally {
            setLoading(false);
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
                            disabled={loading}
                        />
                        {error && <div style={{ color: 'red', fontSize: 14 }}>{error}</div>}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={loading || !prompt}>
                        {loading ? <CircularProgress size={22} /> : "Animate"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default PhotoAnimateDialog;
