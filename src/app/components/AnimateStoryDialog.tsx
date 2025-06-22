import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Box,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent
} from "@mui/material";
import React, { useState } from "react";
import { generateAnimateStory } from "../api/generateAnimateStory";
import { MediaItem } from "../models/MediaItem";
import { MediaType } from "../models/MediaType";

// Helper function for silently generating animated stories (for retry functionality)
export interface SilentAnimateStoryParams {
  parentMediaItem: MediaItem;
  prompt: string;
  gender?: string;
  bodyType?: string;
  skinColor?: string;
  hairColor?: string;
  addMediaItem: (mediaItem: MediaItem) => void;
  updateMediaItem: (mediaItem: MediaItem) => void;
}

export const silentAnimateStory = async (params: SilentAnimateStoryParams) => {
  const { parentMediaItem, prompt, gender = 'woman', bodyType = 'skinny', skinColor = 'tanned', hairColor = 'black', addMediaItem, updateMediaItem } = params;

  const storyMediaItem: MediaItem = {
    id: crypto.randomUUID(),
    type: MediaType.AnimatedStory,
    parent: parentMediaItem,
    prompt,
    loading: true,
    gender,
    body_type: bodyType,
    skin_color: skinColor,
    hair_color: hairColor
  };

  // Add the media item in loading state first
  addMediaItem(storyMediaItem);

  try {
    const result = await generateAnimateStory({
      imageUrl: parentMediaItem.url!,
      prompt,
      gender,
      body_type: bodyType,
      skin_color: skinColor,
      hair_color: hairColor
    });

    // Update with results
    updateMediaItem({
      ...storyMediaItem,
      loading: false,
      url: result.videoUrl,
    });

    return { success: true, mediaItem: storyMediaItem };
  } catch (err: any) {
    console.error("Error generating animated story:", err);
    updateMediaItem({
      ...storyMediaItem,
      loading: false,
      error: err.message || "Failed to generate animated story",
    });
    return { success: false, error: err.message, mediaItem: storyMediaItem };
  }
};

interface AnimateStoryDialogProps {
  mediaItem: MediaItem;
  open: boolean;
  onClose: () => void;
  addMediaItem: (mediaItem: MediaItem) => void;
  updateMediaItem: (mediaItem: MediaItem) => void;
}

const AnimateStoryDialog: React.FC<AnimateStoryDialogProps> = ({ 
  mediaItem, 
  open, 
  onClose, 
  addMediaItem, 
  updateMediaItem 
}) => {
  const [prompt, setPrompt] = useState(mediaItem.prompt || "");
  const [gender, setGender] = useState(mediaItem.gender || "woman");
  const [bodyType, setBodyType] = useState(mediaItem.body_type || "skinny");
  const [skinColor, setSkinColor] = useState(mediaItem.skin_color || "tanned");
  const [hairColor, setHairColor] = useState(mediaItem.hair_color || "black");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenderChange = (e: SelectChangeEvent) => {
    setGender(e.target.value);
  };

  const handleBodyTypeChange = (e: SelectChangeEvent) => {
    setBodyType(e.target.value);
  };

  const handleSkinColorChange = (e: SelectChangeEvent) => {
    setSkinColor(e.target.value);
  };

  const handleHairColorChange = (e: SelectChangeEvent) => {
    setHairColor(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const storyMediaItem: MediaItem = {
      id: crypto.randomUUID(),
      type: MediaType.AnimatedStory,
      parent: mediaItem,
      prompt,
      loading: true,
      gender,
      body_type: bodyType,
      skin_color: skinColor,
      hair_color: hairColor
    };

    // Add the media item in loading state first
    addMediaItem(storyMediaItem);
    onClose();

    try {
      const result = await generateAnimateStory({
        imageUrl: mediaItem.url!,
        prompt,
        gender,
        body_type: bodyType,
        skin_color: skinColor,
        hair_color: hairColor
      });

      // Update with results
      updateMediaItem({
        ...storyMediaItem,
        loading: false,
        url: result.videoUrl,
      });
    } catch (err: any) {
      console.error("Error generating animated story:", err);
      updateMediaItem({
        ...storyMediaItem,
        loading: false,
        error: err.message || "Failed to generate animated story",
      });
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Animate Story with AI</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={3}>
            {mediaItem.url && (
              <Box sx={{ textAlign: "center" }}>
                <img
                  src={mediaItem.url}
                  alt="Source"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "250px",
                    objectFit: "contain",
                  }}
                />
              </Box>
            )}

            <TextField
              label="Animation Prompt"
              fullWidth
              multiline
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the animation you want to create"
              required
            />

            <FormControl fullWidth>
              <InputLabel id="gender-select-label">Gender</InputLabel>
              <Select
                labelId="gender-select-label"
                value={gender}
                label="Gender"
                onChange={handleGenderChange}
              >
                <MenuItem value="woman">Woman</MenuItem>
                <MenuItem value="man">Man</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="bodytype-select-label">Body Type</InputLabel>
              <Select
                labelId="bodytype-select-label"
                value={bodyType}
                label="Body Type"
                onChange={handleBodyTypeChange}
              >
                <MenuItem value="skinny">Skinny</MenuItem>
                <MenuItem value="slim">Slim</MenuItem>
                <MenuItem value="average">Average</MenuItem>
                <MenuItem value="athletic">Athletic</MenuItem>
                <MenuItem value="curvy">Curvy</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="skincolor-select-label">Skin Color</InputLabel>
              <Select
                labelId="skincolor-select-label"
                value={skinColor}
                label="Skin Color"
                onChange={handleSkinColorChange}
              >
                <MenuItem value="pale">Pale</MenuItem>
                <MenuItem value="fair">Fair</MenuItem>
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="tanned">Tanned</MenuItem>
                <MenuItem value="brown">Brown</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="haircolor-select-label">Hair Color</InputLabel>
              <Select
                labelId="haircolor-select-label"
                value={hairColor}
                label="Hair Color"
                onChange={handleHairColorChange}
              >
                <MenuItem value="black">Black</MenuItem>
                <MenuItem value="brown">Brown</MenuItem>
                <MenuItem value="blonde">Blonde</MenuItem>
                <MenuItem value="red">Red</MenuItem>
                <MenuItem value="gray">Gray</MenuItem>
                <MenuItem value="white">White</MenuItem>
              </Select>
            </FormControl>

            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={loading || !prompt.trim()}
          >
            {loading ? "Generating..." : "Generate Animated Story"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AnimateStoryDialog;
