import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField
} from "@mui/material";
import React, { useState } from "react";
import { MediaItem } from "../models/MediaItem";
import { MediaType } from "../models/MediaType";
import { generatePhoto } from "../api/generatePhoto";

interface PhotoTransformDialogProps {
  open: boolean;
  onClose: () => void;
  addMediaItem: (mediaItem: MediaItem) => void;
  updateMediaItem: (mediaItem: MediaItem) => void;
  base64: string;
}

const PhotoTransformDialog: React.FC<PhotoTransformDialogProps> = ({ open, onClose, addMediaItem, updateMediaItem, base64 }) => {
  const [prompt, setPrompt] = useState("");
  const [modelName, setModelName] = useState("base");
  const [style, setStyle] = useState("realistic");
  const [gender, setGender] = useState("man");
  const [bodyType, setBodyType] = useState("lean");
  const [skinColor, setSkinColor] = useState("pale");
  const [autoDetectHairColor, setAutoDetectHairColor] = useState(true);
  const [nsfwPolicy, setNsfwPolicy] = useState("allow");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const mediaItem: MediaItem = {
      id: Date.now().toString(),
      type: MediaType.Image,
      loading: true,
      prompt,
    };
    addMediaItem(mediaItem);

    try {
      if (!base64) {
        updateMediaItem({ ...mediaItem, loading: false, error: "Base64 image is missing" });
        return;
      }
      const result = await generatePhoto({
        identity_image_b64: base64,
        prompt,
        model_name: modelName,
        style,
        gender,
        body_type: bodyType,
        skin_color: skinColor,
        auto_detect_hair_color: autoDetectHairColor,
        nsfw_policy: nsfwPolicy
      });
      if (result.image_b64) {
        updateMediaItem({ ...mediaItem, base64: result.image_b64, loading: false });
      } else {
        updateMediaItem({ ...mediaItem, loading: false, error: result.error || "Failed to generate image" });
      }
    } catch (err: any) {
      updateMediaItem({ ...mediaItem, loading: false, error: err.message || "Network error" });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Transform Photo</DialogTitle>
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
            <TextField
              select
              label="Model Name"
              value={modelName}
              onChange={e => setModelName(e.target.value)}
              fullWidth
            >
              <MenuItem value="base">base</MenuItem>
              <MenuItem value="large">large</MenuItem>
              {/* Add more model options if available */}
            </TextField>
            <TextField
              select
              label="Style"
              value={style}
              onChange={e => setStyle(e.target.value)}
              fullWidth
            >
              <MenuItem value="realistic">realistic</MenuItem>
              <MenuItem value="anime">anime</MenuItem>
              {/* Add more styles if available */}
            </TextField>
            <TextField
              select
              label="Gender"
              value={gender}
              onChange={e => setGender(e.target.value)}
              fullWidth
            >
              <MenuItem value="man">man</MenuItem>
              <MenuItem value="woman">woman</MenuItem>
            </TextField>
            <TextField
              select
              label="Body Type"
              value={bodyType}
              onChange={e => setBodyType(e.target.value)}
              fullWidth
            >
              <MenuItem value="skinny">skinny</MenuItem>
              <MenuItem value="lean">lean</MenuItem>
              <MenuItem value="muscular">muscular</MenuItem>
              <MenuItem value="curvy">curvy</MenuItem>
              <MenuItem value="heavyset">heavyset</MenuItem>
            </TextField>
            <TextField
              select
              label="Skin Color"
              value={skinColor}
              onChange={e => setSkinColor(e.target.value)}
              fullWidth
            >
              <MenuItem value="pale">pale</MenuItem>
              <MenuItem value="white">white</MenuItem>
              <MenuItem value="tanned">tanned</MenuItem>
            </TextField>
            <FormControlLabel
              control={
                <Switch
                  checked={autoDetectHairColor}
                  onChange={e => setAutoDetectHairColor(e.target.checked)}
                />
              }
              label="Auto Detect Hair Color"
            />
            <TextField
              select
              label="NSFW Policy"
              value={nsfwPolicy}
              onChange={e => setNsfwPolicy(e.target.value)}
              fullWidth
            >
              <MenuItem value="blur">blur</MenuItem>
              <MenuItem value="filter">filter</MenuItem>
              <MenuItem value="allow">allow</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={!prompt}>
            {"Generate"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PhotoTransformDialog;
