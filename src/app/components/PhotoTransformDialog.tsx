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
  const [numberOfTransformations, setNumberOfTransformations] = useState(1);
  const [storyMode, setStoryMode] = useState(false);
  const [modelName, setModelName] = useState(mediaItem.model_name || "persona");
  const [style, setStyle] = useState(mediaItem.style || "realistic");
  const [gender, setGender] = useState(mediaItem.gender || "woman");
  const [bodyType, setBodyType] = useState(mediaItem.body_type || "lean");
  const [skinColor, setSkinColor] = useState(mediaItem.skin_color || "white");
  const [autoDetectHairColor, setAutoDetectHairColor] = useState(mediaItem.auto_detect_hair_color || false);
  const [nsfwPolicy, setNsfwPolicy] = useState(mediaItem.nsfw_policy || "allow");
  const [convertPrompt, setConvertPrompt] = useState(mediaItem.convert_prompt !== false);
  const [faceSwap, setFaceSwap] = useState(mediaItem.face_swap || false);

  const loadSavedTransform = (savedTransform: string) => {
    setPrompt(savedTransform);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (storyMode) {
      // Story Mode: Generate images sequentially, each building on the previous
      // First, create all placeholder media items
      const storyMediaItems: MediaItem[] = [];
      const baseTimestamp = Date.now();
      for (let i = 0; i < numberOfTransformations; i++) {
        const storyMediaItem: MediaItem = {
          id: `${baseTimestamp}-story-${i}`,
          type: MediaType.Image,
          loading: true,
          parent: i === 0 ? mediaItem : undefined, // Will be updated for subsequent items
          prompt: `[Step ${i + 1}/${numberOfTransformations}] ${prompt}`,
          model_name: modelName,
          style,
          gender,
          body_type: bodyType,
          skin_color: skinColor,
          auto_detect_hair_color: autoDetectHairColor,
          nsfw_policy: nsfwPolicy,
          convert_prompt: convertPrompt,
          face_swap: faceSwap,
          createdAt: baseTimestamp + i,
          story_sequence: i + 1,
          story_total: numberOfTransformations,
        };
        storyMediaItems.push(storyMediaItem);
        addMediaItem(storyMediaItem);
      }

      // Close dialog immediately
      onClose();

      // Generate images sequentially in the background
      (async () => {
        let currentSourceUrl: string | undefined = mediaItem.url || undefined;
        let currentSourceBase64: string | undefined = undefined;
        const previousPrompts: string[] = [];

        for (let i = 0; i < numberOfTransformations; i++) {
          const currentItem = storyMediaItems[i];

          console.log(`Story Step ${i + 1}: Using base64=${!!currentSourceBase64}, url=${currentSourceUrl?.substring(0, 50)}`);

          try {
            // For step 1, use URL. For subsequent steps, use base64 from previous result
            const requestParams = {
              image_url: i === 0 ? currentSourceUrl : undefined, // Only use URL for first step
              image_base64: i > 0 ? currentSourceBase64 : undefined, // Use base64 for subsequent steps
              prompt: prompt,
              model_name: modelName,
              style,
              gender,
              body_type: bodyType,
              skin_color: skinColor,
              auto_detect_hair_color: autoDetectHairColor,
              nsfw_policy: nsfwPolicy,
              convert_prompt: convertPrompt,
              face_swap: faceSwap,
              story_mode: true,
              story_step: i + 1,
              story_total: numberOfTransformations,
              previous_prompts: previousPrompts,
            };

            const result = await generatePhoto(requestParams);

            if (result.image_url) {
              // Update current item with the result
              const updatedItem = { 
                ...currentItem, 
                url: result.image_url, 
                loading: false,
                parent: i === 0 ? mediaItem : storyMediaItems[i - 1],
                prompt: result.converted_prompt || `[Step ${i + 1}/${numberOfTransformations}] ${prompt}`,
              };
              updateMediaItem(updatedItem);
              storyMediaItems[i] = updatedItem;

              // IMPORTANT: Update the base64 for the NEXT iteration
              // This must happen AFTER we use the current values
              currentSourceBase64 = result.image_base64;
              currentSourceUrl = result.image_url;
              
              console.log(`Story Step ${i + 1} complete: Got base64=${!!result.image_base64}, length=${result.image_base64?.length || 0}`);
              
              // Track the converted prompt for context in next steps
              if (result.converted_prompt) {
                previousPrompts.push(result.converted_prompt);
              }
            } else {
              updateMediaItem({ 
                ...currentItem, 
                loading: false, 
                error: result.error || "Failed to generate image" 
              });
              break;
            }
          } catch (err: any) {
            updateMediaItem({ 
              ...currentItem, 
              loading: false, 
              error: err.message || "Network error" 
            });
            break;
          }
        }
      })();
    } else {
      // Normal Mode: Create multiple transformations in parallel
      for (let i = 0; i < numberOfTransformations; i++) {
        const newMediaItem: MediaItem = {
          id: `${Date.now()}-${i}`,
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
          convert_prompt: convertPrompt,
          face_swap: faceSwap,
          createdAt: Date.now() + i,
        };
        addMediaItem(newMediaItem);

        // Generate photo asynchronously (don't await to create all at once)
        (async () => {
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
              convert_prompt: convertPrompt,
              face_swap: faceSwap,
            });
            if (result.image_url) {
              updateMediaItem({ ...newMediaItem, url: result.image_url, loading: false });
            } else {
              updateMediaItem({ ...newMediaItem, loading: false, error: result.error || "Failed to generate image" });
            }
          } catch (err: any) {
            updateMediaItem({ ...newMediaItem, loading: false, error: err.message || "Network error" });
          }
        })();
      }
      
      // Close dialog after initiating all transformations
      onClose();
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
                  label={storyMode ? "Number of Story Steps" : "Number of Transformations"}
                  type="number"
                  value={numberOfTransformations}
                  onChange={e => setNumberOfTransformations(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                  fullWidth
                  size="small"
                  inputProps={{ min: 1, max: 10 }}
                  helperText={storyMode 
                    ? "Number of sequential images to tell the story (1-10)" 
                    : "Generate 1-10 images (each will have slight variations)"
                  }
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={storyMode}
                      onChange={e => {
                        setStoryMode(e.target.checked);
                        if (e.target.checked && numberOfTransformations < 2) {
                          setNumberOfTransformations(3); // Default to 3 steps for story mode
                        }
                      }}
                      size="small"
                      color="secondary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                        Story Mode
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Generate sequential images that build on each other
                      </Typography>
                    </Box>
                  }
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.9rem' } }}
                />
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
                <FormControlLabel
                  control={
                    <Switch
                      checked={convertPrompt}
                      onChange={e => setConvertPrompt(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Optimize prompt with AI"
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.9rem' } }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={faceSwap}
                      onChange={e => setFaceSwap(e.target.checked)}
                      size="small"
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                        Face Swap
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Swap original face onto generated image
                      </Typography>
                    </Box>
                  }
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.9rem' } }}
                />
              </Stack>
            )}

            {/* Tab 1: Saved Transforms */}
            {tabValue === 1 && (
              <Stack spacing={2}>
                <TextField
                  label={storyMode ? "Number of Story Steps" : "Number of Transformations"}
                  type="number"
                  value={numberOfTransformations}
                  onChange={e => setNumberOfTransformations(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                  fullWidth
                  size="small"
                  inputProps={{ min: 1, max: 10 }}
                  helperText={storyMode 
                    ? "Number of sequential images to tell the story (1-10)" 
                    : "Generate 1-10 images (each will have slight variations)"
                  }
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={storyMode}
                      onChange={e => {
                        setStoryMode(e.target.checked);
                        if (e.target.checked && numberOfTransformations < 2) {
                          setNumberOfTransformations(3);
                        }
                      }}
                      size="small"
                      color="secondary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                        Story Mode
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Generate sequential images that build on each other
                      </Typography>
                    </Box>
                  }
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.9rem' } }}
                />
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
                <TextField
                  label={storyMode ? "Number of Story Steps" : "Number of Transformations"}
                  type="number"
                  value={numberOfTransformations}
                  onChange={e => setNumberOfTransformations(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                  fullWidth
                  size="small"
                  inputProps={{ min: 1, max: 10 }}
                  helperText={storyMode 
                    ? "Number of sequential images to tell the story (1-10)" 
                    : "Generate 1-10 images (each will have slight variations)"
                  }
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={storyMode}
                      onChange={e => {
                        setStoryMode(e.target.checked);
                        if (e.target.checked && numberOfTransformations < 2) {
                          setNumberOfTransformations(3);
                        }
                      }}
                      size="small"
                      color="secondary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                        Story Mode
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Generate sequential images that build on each other
                      </Typography>
                    </Box>
                  }
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.9rem' } }}
                />
                
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

                <FormControlLabel
                  control={
                    <Switch
                      checked={convertPrompt}
                      onChange={e => setConvertPrompt(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Optimize prompt with AI"
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.9rem' } }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={faceSwap}
                      onChange={e => setFaceSwap(e.target.checked)}
                      size="small"
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                        Face Swap
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Swap original face onto generated image
                      </Typography>
                    </Box>
                  }
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
            {storyMode 
              ? `Generate ${numberOfTransformations}-Step Story` 
              : (numberOfTransformations > 1 ? `Transform ${numberOfTransformations} Photos` : 'Transform Photo')
            }
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
  convertPrompt = true,
  faceSwap = false,
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
  convertPrompt?: boolean;
  faceSwap?: boolean;
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
    convert_prompt: convertPrompt,
    face_swap: faceSwap,
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
      convert_prompt: convertPrompt,
      face_swap: faceSwap,
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
