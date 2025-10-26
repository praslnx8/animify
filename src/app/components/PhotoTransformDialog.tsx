import {
  Visibility as VisibilityIcon
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import React, { useState } from "react";
import { generatePhoto } from "../api/generatePhoto";
import transformConfig from '../config/transform_config.json';
import { MediaItem } from "../models/MediaItem";
import { MediaType } from "../models/MediaType";

interface PhotoTransformDialogProps {
  mediaItem: MediaItem;
  open: boolean;
  onClose: () => void;
  addMediaItem: (mediaItem: MediaItem) => void;
  updateMediaItem: (mediaItem: MediaItem) => void;
}

const PhotoTransformDialog: React.FC<PhotoTransformDialogProps> = ({ mediaItem, open, onClose, addMediaItem, updateMediaItem }) => {
  const [prompt, setPrompt] = useState(mediaItem.prompt || "");
  const [tabValue, setTabValue] = useState(0);
  const [modelName, setModelName] = useState(mediaItem.model_name || "base");
  const [style, setStyle] = useState(mediaItem.style || "realistic");
  const [gender, setGender] = useState(mediaItem.gender || "woman");
  const [bodyType, setBodyType] = useState(mediaItem.body_type || "lean");
  const [skinColor, setSkinColor] = useState(mediaItem.skin_color || "tanned");
  const [autoDetectHairColor, setAutoDetectHairColor] = useState(mediaItem.auto_detect_hair_color || false);
  const [nsfwPolicy, setNsfwPolicy] = useState(mediaItem.nsfw_policy || "allow");

  const loadSavedTransform = (savedTransform: string) => {
    setPrompt(savedTransform);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newMediaItem: MediaItem = {
      id: Date.now().toString(),
      type: MediaType.Image,
      loading: true,
      parent: mediaItem,
      prompt: prompt,
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
        image_url: mediaItem.url || "",
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
              <Tab label="Advanced" />
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
                  Saved Transforms ({transformConfig.transformations.length})
                </Typography>
                {transformConfig.transformations.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{
                    textAlign: 'center',
                    py: 3,
                    fontSize: '0.85rem'
                  }}>
                    No saved transforms yet.
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {transformConfig.transformations.map((saved) => (
                      <Box
                        sx={{
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1,
                          p: 1.5
                        }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="subtitle2" sx={{ fontSize: '0.9rem', fontWeight: 600 }}>
                            {saved}
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
                          {saved}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Stack>
            )}

            {/* Tab 2: Advanced Settings */}
            {tabValue === 2 && (
              <Stack spacing={2}>
                <Typography variant="subtitle2" sx={{ fontSize: '0.9rem' }}>
                  Generation Settings
                </Typography>
                
                <TextField
                  label="Transformation Description"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  fullWidth
                  required
                  multiline
                  minRows={2}
                  maxRows={4}
                  variant="outlined"
                  helperText="Describe how to transform the selfie"
                  size="small"
                />

                <FormControl size="small" fullWidth>
                  <InputLabel>Model</InputLabel>
                  <Select
                    value={modelName}
                    label="Model"
                    onChange={e => setModelName(e.target.value)}
                  >
                    <MenuItem value="base">Base</MenuItem>
                    <MenuItem value="large">Large</MenuItem>
                    <MenuItem value="persona">Persona</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth>
                  <InputLabel>Style</InputLabel>
                  <Select
                    value={style}
                    label="Style"
                    onChange={e => setStyle(e.target.value)}
                  >
                    <MenuItem value="realistic">Realistic</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={gender}
                    label="Gender"
                    onChange={e => setGender(e.target.value)}
                  >
                    <MenuItem value="woman">Woman</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth>
                  <InputLabel>Body Type</InputLabel>
                  <Select
                    value={bodyType}
                    label="Body Type"
                    onChange={e => setBodyType(e.target.value)}
                  >
                    <MenuItem value="skinny">Skinny</MenuItem>
                    <MenuItem value="lean">Lean</MenuItem>
                    <MenuItem value="muscular">Muscular</MenuItem>
                    <MenuItem value="curvy">Curvy</MenuItem>
                    <MenuItem value="heavyset">Heavyset</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth>
                  <InputLabel>Skin Color</InputLabel>
                  <Select
                    value={skinColor}
                    label="Skin Color"
                    onChange={e => setSkinColor(e.target.value)}
                  >
                    <MenuItem value="pale">Pale</MenuItem>
                    <MenuItem value="white">White</MenuItem>
                    <MenuItem value="tanned">Tanned</MenuItem>
                    <MenuItem value="black">Black</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth>
                  <InputLabel>NSFW Policy</InputLabel>
                  <Select
                    value={nsfwPolicy}
                    label="NSFW Policy"
                    onChange={e => setNsfwPolicy(e.target.value)}
                  >
                    <MenuItem value="allow">Allow</MenuItem>
                    <MenuItem value="blur">Blur</MenuItem>
                    <MenuItem value="filter">Filter</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={autoDetectHairColor}
                      onChange={e => setAutoDetectHairColor(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Auto-detect hair color"
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.9rem' } }}
                />
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
  style = 'realistic',
  gender = 'woman',
  bodyType = 'lean',
  skinColor = 'tanned',
  autoDetectHairColor = false,
  nsfwPolicy = 'allow',
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
