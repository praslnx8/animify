import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Stack,
} from "@mui/material";
import { uploadBase64Image } from "../api/uploadBase64Image";
import { generateVideo } from "../api/generateVideo";
import { Message } from "../models/Message";

interface ChatAnimateDialogProps {
  message: Message | null;
  open: boolean;
  onClose: () => void;
  onLoading: () => void;
  onComplete: (url?: string) => void;
}

const ChatAnimateDialog: React.FC<ChatAnimateDialogProps> = ({
  message,
  open,
  onClose,
  onLoading,
  onComplete,
}) => {
  const [prompt, setPrompt] = useState<string>(message?.prompt || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onLoading();

    try {
      const imageUrl = await uploadBase64Image(message?.image || '');
      const result = await generateVideo({ image_url: imageUrl, prompt });

      if (result.videoUrl) {
        onComplete(result.videoUrl);
      } else {
        console.error("Error generating video:", result.error || "An error occurred");
        onComplete('');
      }
    } catch (err: any) {
      onComplete('');
      console.error("Error generating video:", err.message || "An error occurred");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Animate Chat Image</Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              label="Prompt"
              value={message?.prompt || prompt}
              onChange={(e) => setPrompt(e.target.value)}
              fullWidth
              multiline
              rows={6}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={!prompt.trim()}>
            Generate Video
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ChatAnimateDialog;
