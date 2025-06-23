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
  const [savedTransforms, setSavedTransforms] = useState<SavedTransform[]>([]);
  const [transformName, setTransformName] = useState("");
  
  // Structured transform components
  const [components, setComponents] = useState<TransformComponents>({
    scene: "",
    setting: "",
    clothing: "",
    pose: "",
    mood: "",
    lighting: "",
    style: "",
    culturalElements: ""
  });

  // Advanced settings
  const [modelName, setModelName] = useState(mediaItem.parent?.model_name || "base");
  const [style, setStyle] = useState(mediaItem.parent?.style || "realistic");
  const [gender, setGender] = useState(mediaItem.parent?.gender || "woman");
  const [bodyType, setBodyType] = useState(mediaItem.parent?.body_type || "lean");
  const [skinColor, setSkinColor] = useState(mediaItem.parent?.skin_color || "tanned");
  const [autoDetectHairColor, setAutoDetectHairColor] = useState<boolean>(mediaItem.parent?.auto_detect_hair_color || false);
  const [nsfwPolicy, setNsfwPolicy] = useState(mediaItem.parent?.nsfw_policy || "allow");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load saved transforms from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('animify_saved_transforms');
    if (saved) {
      setSavedTransforms(JSON.parse(saved));
    }
  }, []);

  // Auto-generate prompt from components
  useEffect(() => {
    if (tabValue === 1) { // Only when on structured tab
      generatePromptFromComponents();
    }
  }, [components, tabValue]);

  const generatePromptFromComponents = () => {
    const parts = [];
    
    parts.push("A South Indian person");
    if (components.clothing) parts.push(`wearing ${components.clothing}`);
    if (components.pose) parts.push(`${components.pose}`);
    if (components.scene) parts.push(`in ${components.scene}`);
    if (components.setting) parts.push(`Setting: ${components.setting}`);
    if (components.mood) parts.push(`Mood: ${components.mood}`);
    if (components.culturalElements) parts.push(`Cultural elements: ${components.culturalElements}`);
    if (components.lighting) parts.push(`Lighting: ${components.lighting}`);
    if (components.style) parts.push(`Style: ${components.style}`);
    
    const generatedPrompt = parts.filter(Boolean).join(', ').replace(/,\s*,/g, ',');
    if (generatedPrompt.length > 20) {
      setPrompt(generatedPrompt);
    }
  };

  const saveTransform = () => {
    if (!transformName.trim() || !prompt.trim()) return;
    
    const newSavedTransform: SavedTransform = {
      id: Date.now().toString(),
      name: transformName,
      prompt,
      components: { ...components },
      createdAt: new Date().toLocaleDateString()
    };
    
    const updated = [...savedTransforms, newSavedTransform];
    setSavedTransforms(updated);
    localStorage.setItem('animify_saved_transforms', JSON.stringify(updated));
    setTransformName("");
  };

  const loadSavedTransform = (savedTransform: SavedTransform) => {
    setPrompt(savedTransform.prompt);
    setComponents(savedTransform.components);
  };

  const deleteSavedTransform = (id: string) => {
    const updated = savedTransforms.filter(t => t.id !== id);
    setSavedTransforms(updated);
    localStorage.setItem('animify_saved_transforms', JSON.stringify(updated));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newMediaItem: MediaItem = {
      id: Date.now().toString(),
      type: MediaType.Image,
      loading: true,
      parent: mediaItem,
      prompt: prompt,
      model_name: modelName,
      style: style,
      gender: gender,
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
        nsfw_policy: nsfwPolicy
      });
      if (result.image_url) {
        updateMediaItem({ ...newMediaItem, url: result.image_url, loading: false });
      } else {
        updateMediaItem({ ...newMediaItem, loading: false, error: result.error || "Failed to generate image" });
      }
    } catch (err: any) {
      updateMediaItem({ ...newMediaItem, loading: false, error: err.message || "Network error" });
    } finally {
      setIsSubmitting(false);
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
              <Tab label="Builder" />
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

                {/* Quick Examples */}
                <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontSize: '0.9rem' }}>
                    Indian Scene Templates
                  </Typography>
                  <Stack spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      fullWidth
                      sx={{ 
                        justifyContent: 'flex-start', 
                        textAlign: 'left',
                        fontSize: '0.8rem',
                        py: 1.5,
                        textTransform: 'none'
                      }}
                      onClick={() => setPrompt('South Indian woman wearing a traditional cotton nighty, ankle-length, floral print, short sleeves, loose-fitting, standing in a tiled house corridor, realistic, Indian home setting')}
                    >
                      Traditional Nighty at Home
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      fullWidth
                      sx={{ 
                        justifyContent: 'flex-start', 
                        textAlign: 'left',
                        fontSize: '0.8rem',
                        py: 1.5,
                        textTransform: 'none'
                      }}
                      onClick={() => setPrompt('Point of view from a South Indian man sitting down, looking slightly upward at a South Indian woman in her 40s wearing a traditional floral cotton nighty, standing and slightly bending forward to offer a stainless steel tumbler of tea with one hand, realistic indoor lighting, tiled floor, simple South Indian home interior, camera angle from eye level of the man, the woman is in focus, no sitting pose')}
                    >
                      Serving Tea Scene
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      fullWidth
                      sx={{ 
                        justifyContent: 'flex-start', 
                        textAlign: 'left',
                        fontSize: '0.8rem',
                        py: 1.5,
                        textTransform: 'none'
                      }}
                      onClick={() => setPrompt('A South Indian middle-aged woman wearing a loose-fitting cotton floral nighty, standing beside a young adult man in casual Indian homewear (t-shirt and lungi), both inside a small tiled South Indian house, chatting casually in the kitchen while she helps him with something on the counter, stainless steel utensils on the shelf, window light coming in, ceiling fan above, realistic documentary-style scene, warm and friendly atmosphere, no modern furniture, no Western dress')}
                    >
                      Kitchen Helper Scene
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      fullWidth
                      sx={{ 
                        justifyContent: 'flex-start', 
                        textAlign: 'left',
                        fontSize: '0.8rem',
                        py: 1.5,
                        textTransform: 'none'
                      }}
                      onClick={() => setPrompt('A South Indian aunty in a maroon floral nighty helping her young male neighbor with documents at a dining table, ceiling fan above, framed family photos in background, stainless steel plate on table, calm and realistic setting')}
                    >
                      Document Helper Scene
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            )}

            {/* Tab 1: Structured Builder */}
            {tabValue === 1 && (
              <Stack spacing={2}>
                {/* Scene Type */}
                <Accordion defaultExpanded>
                  <AccordionSummary 
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ minHeight: '44px' }}
                  >
                    <Typography variant="subtitle1" sx={{ fontSize: '1rem' }}>Scene & Context</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <Stack spacing={2}>
                      <Autocomplete
                        freeSolo
                        size="small"
                        options={[
                          'Traditional South Indian home scene',
                          'Kitchen helping scene',
                          'Tea serving moment',
                          'Family conversation scene',
                          'Neighbor interaction',
                          'Document assistance scene',
                          'Festival celebration',
                          'Daily household activity'
                        ]}
                        value={components.scene}
                        onChange={(_, newValue) => setComponents(prev => ({ ...prev, scene: newValue || '' }))}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Scene Type"
                            placeholder="What kind of scene?"
                            helperText="Context of the scene"
                            size="small"
                          />
                        )}
                      />
                    </Stack>
                  </AccordionDetails>
                </Accordion>

                {/* Clothing & Appearance */}
                <Accordion>
                  <AccordionSummary 
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ minHeight: '44px' }}
                  >
                    <Typography variant="subtitle1" sx={{ fontSize: '1rem' }}>Clothing & Style</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <Stack spacing={2}>
                      <Autocomplete
                        freeSolo
                        size="small"
                        options={[
                          'traditional cotton nighty with floral print',
                          'simple saree with traditional border',
                          'casual Indian homewear',
                          'traditional kurta and dupatta',
                          'cotton salwar kameez',
                          'simple blouse and skirt',
                          'festival traditional wear'
                        ]}
                        value={components.clothing}
                        onChange={(_, newValue) => setComponents(prev => ({ ...prev, clothing: newValue || '' }))}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Clothing"
                            placeholder="What clothing to wear?"
                            helperText="Traditional Indian clothing"
                            size="small"
                          />
                        )}
                      />

                      <Autocomplete
                        freeSolo
                        size="small"
                        options={[
                          'standing naturally',
                          'slightly bending forward offering something',
                          'sitting at dining table',
                          'standing near kitchen counter',
                          'helping with documents',
                          'serving tea or food',
                          'casual conversation pose'
                        ]}
                        value={components.pose}
                        onChange={(_, newValue) => setComponents(prev => ({ ...prev, pose: newValue || '' }))}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Pose & Action"
                            placeholder="Body pose and action"
                            helperText="How is the person positioned"
                            size="small"
                          />
                        )}
                      />
                    </Stack>
                  </AccordionDetails>
                </Accordion>

                {/* Setting & Environment */}
                <Accordion>
                  <AccordionSummary 
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ minHeight: '44px' }}
                  >
                    <Typography variant="subtitle1" sx={{ fontSize: '1rem' }}>Setting</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <Stack spacing={2}>
                      <Autocomplete
                        freeSolo
                        size="small"
                        options={[
                          'simple South Indian home interior',
                          'traditional kitchen with steel utensils',
                          'tiled floor corridor',
                          'dining area with simple furniture',
                          'living room with traditional setup',
                          'courtyard with traditional elements',
                          'village home setting'
                        ]}
                        value={components.setting}
                        onChange={(_, newValue) => setComponents(prev => ({ ...prev, setting: newValue || '' }))}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Setting"
                            placeholder="Where is this happening?"
                            helperText="Location and environment"
                            size="small"
                          />
                        )}
                      />
                      
                      <TextField
                        label="Cultural Elements"
                        value={components.culturalElements}
                        onChange={e => setComponents(prev => ({ ...prev, culturalElements: e.target.value }))}
                        fullWidth
                        placeholder="e.g., ceiling fan, steel utensils, family photos, rangoli"
                        helperText="Traditional Indian elements"
                        size="small"
                      />
                      
                      <FormControl fullWidth size="small">
                        <InputLabel sx={{ fontSize: '0.9rem' }}>Lighting</InputLabel>
                        <Select
                          value={components.lighting}
                          onChange={e => setComponents(prev => ({ ...prev, lighting: e.target.value }))}
                          sx={{ fontSize: '0.9rem' }}
                        >
                          <MenuItem value="">Select lighting...</MenuItem>
                          <MenuItem value="natural window light">Natural Window Light</MenuItem>
                          <MenuItem value="warm tube light">Tube Light</MenuItem>
                          <MenuItem value="soft indoor lighting">Soft Indoor</MenuItem>
                          <MenuItem value="morning sunlight">Morning Sun</MenuItem>
                          <MenuItem value="evening light">Evening Light</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
                  </AccordionDetails>
                </Accordion>

                {/* Mood & Style */}
                <Accordion>
                  <AccordionSummary 
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ minHeight: '44px' }}
                  >
                    <Typography variant="subtitle1" sx={{ fontSize: '1rem' }}>Mood & Style</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <Stack spacing={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel sx={{ fontSize: '0.9rem' }}>Mood</InputLabel>
                        <Select
                          value={components.mood}
                          onChange={e => setComponents(prev => ({ ...prev, mood: e.target.value }))}
                          sx={{ fontSize: '0.9rem' }}
                        >
                          <MenuItem value="">Select mood...</MenuItem>
                          <MenuItem value="warm and friendly">Warm & Friendly</MenuItem>
                          <MenuItem value="calm and peaceful">Calm & Peaceful</MenuItem>
                          <MenuItem value="helpful and caring">Helpful & Caring</MenuItem>
                          <MenuItem value="traditional and respectful">Traditional & Respectful</MenuItem>
                          <MenuItem value="natural and candid">Natural & Candid</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <FormControl fullWidth size="small">
                        <InputLabel sx={{ fontSize: '0.9rem' }}>Style</InputLabel>
                        <Select
                          value={components.style}
                          onChange={e => setComponents(prev => ({ ...prev, style: e.target.value }))}
                          sx={{ fontSize: '0.9rem' }}
                        >
                          <MenuItem value="">Select style...</MenuItem>
                          <MenuItem value="realistic documentary style">Documentary Realistic</MenuItem>
                          <MenuItem value="natural candid style">Natural Candid</MenuItem>
                          <MenuItem value="traditional Indian photography">Traditional Photography</MenuItem>
                          <MenuItem value="cinematic realistic">Cinematic Realistic</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
                  </AccordionDetails>
                </Accordion>

                {/* Generated Prompt Preview */}
                <Box sx={{ 
                  border: 1, 
                  borderColor: 'primary.main', 
                  borderRadius: 2, 
                  p: 1.5, 
                  bgcolor: 'primary.50' 
                }}>
                  <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontSize: '0.9rem' }}>
                    Generated Prompt:
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    fontStyle: 'italic', 
                    minHeight: '30px',
                    fontSize: '0.85rem',
                    lineHeight: 1.4
                  }}>
                    {prompt || 'Fill components to see prompt...'}
                  </Typography>
                </Box>
              </Stack>
            )}

            {/* Tab 2: Saved Transforms */}
            {tabValue === 2 && (
              <Stack spacing={2}>
                {/* Save Current Transform */}
                <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontSize: '0.9rem' }}>Save Current</Typography>
                  <Stack spacing={1}>
                    <TextField
                      label="Transform Name"
                      value={transformName}
                      onChange={e => setTransformName(e.target.value)}
                      size="small"
                      placeholder="e.g., Nighty Kitchen Scene"
                      fullWidth
                    />
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<SaveIcon />}
                      onClick={saveTransform}
                      disabled={!transformName.trim() || !prompt.trim()}
                      fullWidth
                      sx={{ py: 1.5 }}
                    >
                      Save Transform
                    </Button>
                  </Stack>
                </Box>

                <Divider />

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
                    No saved transforms yet. Create and save your first transform!
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

            {/* Tab 3: Advanced Settings */}
            {tabValue === 3 && (
              <Stack spacing={2}>
                <Typography variant="subtitle2" sx={{ fontSize: '0.9rem', mb: 1 }}>
                  Model Settings
                </Typography>

                <Stack spacing={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ fontSize: '0.9rem' }}>Model</InputLabel>
                    <Select
                      value={modelName}
                      onChange={e => setModelName(e.target.value)}
                      sx={{ fontSize: '0.9rem' }}
                    >
                      <MenuItem value="base">Base Model</MenuItem>
                      <MenuItem value="large">Large Model</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ fontSize: '0.9rem' }}>Image Style</InputLabel>
                    <Select
                      value={style}
                      onChange={e => setStyle(e.target.value)}
                      sx={{ fontSize: '0.9rem' }}
                    >
                      <MenuItem value="realistic">Realistic</MenuItem>
                      <MenuItem value="anime">Anime</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ fontSize: '0.9rem' }}>Gender</InputLabel>
                    <Select
                      value={gender}
                      onChange={e => setGender(e.target.value)}
                      sx={{ fontSize: '0.9rem' }}
                    >
                      <MenuItem value="man">Man</MenuItem>
                      <MenuItem value="woman">Woman</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ fontSize: '0.9rem' }}>Body Type</InputLabel>
                    <Select
                      value={bodyType}
                      onChange={e => setBodyType(e.target.value)}
                      sx={{ fontSize: '0.9rem' }}
                    >
                      <MenuItem value="skinny">Skinny</MenuItem>
                      <MenuItem value="lean">Lean</MenuItem>
                      <MenuItem value="muscular">Muscular</MenuItem>
                      <MenuItem value="curvy">Curvy</MenuItem>
                      <MenuItem value="heavyset">Heavyset</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ fontSize: '0.9rem' }}>Skin Color</InputLabel>
                    <Select
                      value={skinColor}
                      onChange={e => setSkinColor(e.target.value)}
                      sx={{ fontSize: '0.9rem' }}
                    >
                      <MenuItem value="pale">Pale</MenuItem>
                      <MenuItem value="white">White</MenuItem>
                      <MenuItem value="tanned">Tanned</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ fontSize: '0.9rem' }}>NSFW Policy</InputLabel>
                    <Select
                      value={nsfwPolicy}
                      onChange={e => setNsfwPolicy(e.target.value)}
                      sx={{ fontSize: '0.9rem' }}
                    >
                      <MenuItem value="blur">Blur</MenuItem>
                      <MenuItem value="filter">Filter</MenuItem>
                      <MenuItem value="allow">Allow</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoDetectHairColor}
                        onChange={e => setAutoDetectHairColor(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Auto-detect hair color"
                    sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.9rem' } }}
                  />
                </Stack>
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
            disabled={isSubmitting}
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
            disabled={!prompt.trim() || isSubmitting}
            size="large"
            sx={{ 
              flex: 2,
              py: 1.5,
              fontSize: '1rem'
            }}
          >
            {isSubmitting ? "Generating..." : "Transform Image"}
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
