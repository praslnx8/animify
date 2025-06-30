import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
  Tabs,
  Tab,
  Chip,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Divider
} from "@mui/material";
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from "@mui/icons-material";
import React, { useState, useEffect } from "react";
import { generatePhoto } from "../api/generatePhoto";
import { MediaItem } from "../models/MediaItem";
import { MediaType } from "../models/MediaType";
import transformConfig from '../config/transform_config.json';

interface PhotoTransformDialogProps {
  mediaItem: MediaItem;
  open: boolean;
  onClose: () => void;
  addMediaItem: (mediaItem: MediaItem) => void;
  updateMediaItem: (mediaItem: MediaItem) => void;
}

// Transform component interfaces
interface TransformComponents {
  scene: string;
  setting: string;
  clothing: string;
  pose: string;
  mood: string;
  lighting: string;
  style: string;
  culturalElements: string;
}

interface SavedTransform {
  id: string;
  name: string;
  prompt: string;
  components: TransformComponents;
  createdAt: string;
}

const PhotoTransformDialog: React.FC<PhotoTransformDialogProps> = ({ mediaItem, open, onClose, addMediaItem, updateMediaItem }) => {
  const [prompt, setPrompt] = useState(mediaItem.prompt || "");
  const [tabValue, setTabValue] = useState(0);
  const [savedTransforms, setSavedTransforms] = useState<SavedTransform[]>(transformConfig.map((item, index) => ({
    id: index.toString(),
    name: `Transform ${index + 1}`,
    prompt: item.prompt,
    components: {
      scene: "",
      setting: "",
      clothing: "",
      pose: "",
      mood: "",
      lighting: "",
      style: "",
      culturalElements: ""
    },
    createdAt: new Date().toLocaleDateString()
  })));

  const loadSavedTransform = (savedTransform: SavedTransform) => {
    setPrompt(savedTransform.prompt);
  };

  const deleteSavedTransform = (id: string) => {
    const updated = savedTransforms.filter(t => t.id !== id);
    setSavedTransforms(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newMediaItem: MediaItem = {
      id: Date.now().toString(),
      type: MediaType.Image,
      loading: true,
      parent: mediaItem,
      prompt: prompt,
    };
    addMediaItem(newMediaItem);

    try {
      const result = await generatePhoto({
        image_url: mediaItem.url || "",
        prompt,
      });
      if (result.image_url) {
        updateMediaItem({ ...newMediaItem, url: result.image_url, loading: false });
      } else {
        updateMediaItem({ ...newMediaItem, loading: false, error: result.error || "Failed to generate image" });
      }
    } catch (err: any) {
      updateMediaItem({ ...newMediaItem, loading: false, error: err.message || "Network error" });
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
            Transform Photo
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

            {/* Tab 0: Quick Transform Mode */}
            {tabValue === 0 && (
              <Stack spacing={2}>
                <TextField
                  label="Transformation Description"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  fullWidth
                  required
                  autoFocus
                  multiline
                  minRows={2}
                  maxRows={4}
                  variant="outlined"
                  helperText="Describe how to transform the selfie"
                  size="small"
                />
              </Stack>
            )}

            {/* Tab 1: Saved Transforms */}
            {tabValue === 1 && (
              <Stack spacing={2}>
                {/* Saved Transforms List */}
                <Typography variant="subtitle2" sx={{ fontSize: '0.9rem' }}>
                  Saved Transforms ({savedTransforms.length})
                </Typography>
                {savedTransforms.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{
                    textAlign: 'center',
                    py: 3,
                    fontSize: '0.85rem'
                  }}>
                    No saved transforms yet.
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {savedTransforms.map((saved) => (
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
                              onClick={() => loadSavedTransform(saved)}
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
                              onClick={() => deleteSavedTransform(saved.id)}
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
            Transform Photo
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// Utility function for silent photo transform (for retry)
export async function silentPhotoTransform({
  parentMediaItem,
  prompt,
  addMediaItem,
  updateMediaItem,
  modelName = 'base',
  style = 'anime',
  gender = 'man',
  bodyType = 'lean',
  skinColor = 'pale',
  autoDetectHairColor = true,
  nsfwPolicy = 'filter',
}: {
  parentMediaItem: MediaItem;
  prompt: string;
  addMediaItem: (item: MediaItem) => void;
  updateMediaItem: (item: MediaItem) => void;
  modelName?: string;
  style?: string;
  gender?: string;
  bodyType?: string;
  skinColor?: string;
  autoDetectHairColor?: boolean;
  nsfwPolicy?: string;
}) {
  const newMediaItem: MediaItem = {
    id: Date.now().toString(),
    type: MediaType.Image,
    loading: true,
    parent: parentMediaItem,
    prompt,
    model_name: modelName,
    style,
    gender,
    body_type: bodyType,
    skin_color: skinColor,
    auto_detect_hair_color: autoDetectHairColor,
    nsfw_policy: nsfwPolicy,
  };
  addMediaItem(newMediaItem);
  try {
    const result = await generatePhoto({
      image_url: parentMediaItem.url || '',
      prompt,
      model_name: modelName,
      style,
      gender,
      body_type: bodyType,
      skin_color: skinColor,
      auto_detect_hair_color: autoDetectHairColor,
      nsfw_policy: nsfwPolicy,
    });
    if (result.image_url) {
      updateMediaItem({ ...newMediaItem, url: result.image_url, loading: false });
    } else {
      updateMediaItem({ ...newMediaItem, loading: false, error: result.error || 'Failed to generate image' });
    }
  } catch (err: any) {
    updateMediaItem({ ...newMediaItem, loading: false, error: err.message || 'Network error' });
  }
}

export default PhotoTransformDialog;
