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
  Tabs,
  Tab,
  Chip,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from "@mui/icons-material";
import React, { useState, useEffect } from "react";
import { generateVideo } from "../api/generateVideo";
import { MediaItem } from "../models/MediaItem";
import { MediaType } from "../models/MediaType";
import animateConfig from '../config/animate_config.json';

interface PhotoAnimateDialogProps {
  mediaItem: MediaItem;
  open: boolean;
  onClose: () => void;
  addMediaItem: (mediaItem: MediaItem) => void;
  updateMediaItem: (mediaItem: MediaItem) => void;
}

// Prompt component interfaces
interface PromptComponents {
  characters: string;
  scene: string;
  dialogue: string;
  interactions: string;
  setting: string;
  camera: string;
  style: string;
  lighting: string;
  duration: string;
  seriesGenre: string;
  culturalElements: string;
}

interface SavedPrompt {
  id: string;
  name: string;
  prompt: string;
  components: PromptComponents;
  createdAt: string;
}

const PhotoAnimateDialog: React.FC<PhotoAnimateDialogProps> = ({ mediaItem, open, onClose, addMediaItem, updateMediaItem }) => {
  const [prompt, setPrompt] = useState(mediaItem.prompt || "");
  const [tabValue, setTabValue] = useState(0);
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>(animateConfig.map((item, index) => ({
    id: index.toString(),
    name: `Prompt ${index + 1}`,
    prompt: item.prompt,
    components: {
      characters: "",
      scene: "",
      dialogue: "",
      interactions: "",
      setting: "",
      camera: "",
      style: "",
      lighting: "",
      duration: "",
      seriesGenre: "",
      culturalElements: ""
    },
    createdAt: new Date().toLocaleDateString()
  })));

  const loadSavedPrompt = (savedPrompt: SavedPrompt) => {
    setPrompt(savedPrompt.prompt);
  };

  const deleteSavedPrompt = (id: string) => {
    const updated = savedPrompts.filter(p => p.id !== id);
    setSavedPrompts(updated);
  };

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
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth 
      fullScreen
      sx={{
        '& .MuiDialog-paper': {
          margin: 0,
          maxHeight: '100vh',
          borderRadius: 0,
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="div" sx={{ fontSize: '1.1rem' }}>
            Animate Photo
          </Typography>
          {prompt && (
            <Chip 
              icon={<VisibilityIcon />}
              label={`${prompt.length}`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
          )}
        </Box>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ px: 2, py: 1 }}>
          <Stack spacing={2}>
            {/* Tab Navigation */}
            <Tabs 
              value={tabValue} 
              onChange={(_, newValue) => setTabValue(newValue)}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  fontSize: '0.85rem',
                  minHeight: '44px',
                  padding: '8px 4px'
                }
              }}
            >
              <Tab label="Quick" />
              <Tab label="Saved" />
            </Tabs>

            {/* Tab 0: Free Text Mode */}
            {tabValue === 0 && (
              <Stack spacing={2}>
                <TextField
                  label="Prompt"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  fullWidth
                  required
                  autoFocus
                  multiline
                  minRows={2}
                  maxRows={4}
                  variant="outlined"
                  helperText="Describe the scene animation"
                  size="small"
                />
              </Stack>
            )}

            {/* Tab 1: Saved Prompts */}
            {tabValue === 1 && (
              <Stack spacing={2}>
                {/* Saved Prompts List */}
                <Typography variant="subtitle2" sx={{ fontSize: '0.9rem' }}>
                  Saved Templates ({savedPrompts.length})
                </Typography>
                {savedPrompts.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    textAlign: 'center', 
                    py: 3,
                    fontSize: '0.85rem'
                  }}>
                    No saved templates yet.
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {savedPrompts.map((saved) => (
                      <Box
                        key={saved.id}
                        sx={{ 
                          border: 1, 
                          borderColor: 'divider', 
                          borderRadius: 1, 
                          p: 1.5 
                        }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="subtitle2" sx={{ fontSize: '0.9rem', fontWeight: 600 }}>
                            {saved.name}
                          </Typography>
                          <Box display="flex" gap={0.5}>
                            <Button
                              size="small"
                              onClick={() => loadSavedPrompt(saved)}
                              variant="contained"
                              sx={{ 
                                minWidth: 'auto',
                                px: 2,
                                py: 0.5,
                                fontSize: '0.75rem'
                              }}
                            >
                              Use
                            </Button>
                            <IconButton
                              size="small"
                              onClick={() => deleteSavedPrompt(saved.id)}
                              color="error"
                              sx={{ p: 0.5 }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            fontSize: '0.8rem',
                            lineHeight: 1.3,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {saved.prompt}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          {saved.createdAt}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ 
          px: 2, 
          py: 1.5, 
          gap: 1,
          position: 'sticky',
          bottom: 0,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider'
        }}>
          <Button 
            onClick={onClose}
            size="large"
            sx={{ 
              flex: 1,
              py: 1.5,
              fontSize: '1rem'
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={!prompt.trim()}
            size="large"
            sx={{ 
              flex: 2,
              py: 1.5,
              fontSize: '1rem'
            }}
          >
            Generate Video
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
