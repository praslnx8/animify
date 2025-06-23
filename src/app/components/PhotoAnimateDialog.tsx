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
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [promptName, setPromptName] = useState("");
  
  // Structured prompt components
  const [components, setComponents] = useState<PromptComponents>({
    characters: "",
    scene: "",
    dialogue: "",
    interactions: "",
    setting: "",
    camera: "",
    style: "",
    lighting: "",
    duration: "10-second",
    seriesGenre: "",
    culturalElements: ""
  });

  // Load saved prompts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('animify_saved_prompts');
    if (saved) {
      setSavedPrompts(JSON.parse(saved));
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
    
    if (components.duration) parts.push(`A ${components.duration} video`);
    if (components.characters) parts.push(`featuring ${components.characters}`);
    if (components.scene) parts.push(`Scene: ${components.scene}`);
    if (components.dialogue) parts.push(`Dialogue/Action: ${components.dialogue}`);
    if (components.interactions) parts.push(`Character interactions: ${components.interactions}`);
    if (components.setting) parts.push(`Setting: ${components.setting}`);
    if (components.culturalElements) parts.push(`Cultural elements: ${components.culturalElements}`);
    if (components.camera) parts.push(`Camera: ${components.camera}`);
    if (components.lighting) parts.push(`Lighting: ${components.lighting}`);
    if (components.style) parts.push(`Style: ${components.style} ${components.seriesGenre ? `${components.seriesGenre} series` : ''}`);
    
    const generatedPrompt = parts.filter(Boolean).join('. ').replace(/\.\./g, '.');
    if (generatedPrompt.length > 10) {
      setPrompt(generatedPrompt);
    }
  };

  const savePrompt = () => {
    if (!promptName.trim() || !prompt.trim()) return;
    
    const newSavedPrompt: SavedPrompt = {
      id: Date.now().toString(),
      name: promptName,
      prompt,
      components: { ...components },
      createdAt: new Date().toLocaleDateString()
    };
    
    const updated = [...savedPrompts, newSavedPrompt];
    setSavedPrompts(updated);
    localStorage.setItem('animify_saved_prompts', JSON.stringify(updated));
    setPromptName("");
  };

  const loadSavedPrompt = (savedPrompt: SavedPrompt) => {
    setPrompt(savedPrompt.prompt);
    setComponents(savedPrompt.components);
  };

  const deleteSavedPrompt = (id: string) => {
    const updated = savedPrompts.filter(p => p.id !== id);
    setSavedPrompts(updated);
    localStorage.setItem('animify_saved_prompts', JSON.stringify(updated));
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
              <Tab label="Builder" />
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

                {/* Quick Examples */}
                <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontSize: '0.9rem' }}>
                    Quick Templates
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
                      onClick={() => setPrompt('A 10-second family drama scene of a South Indian mother in saree having an emotional conversation with her adult son in the traditional kitchen. The mother gestures expressively while explaining something important, ceiling fan spinning overhead, brass vessels visible in background. Camera slowly pans capturing their expressions. Warm tube light lighting, realistic TV series style.')}
                    >
                      Family Drama Kitchen Scene
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
                      onClick={() => setPrompt('A 10-second romantic scene featuring a young Indian couple in traditional clothing having a shy conversation in a decorated courtyard. The woman looks down bashfully while the man speaks gently. Soft golden hour lighting with diyas in background. Camera focuses on their reactions. Traditional Indian cinema style.')}
                    >
                      Romantic Courtyard Scene
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
                      onClick={() => setPrompt('A 10-second social drama scene of multiple family members gathered around dining table discussing important family matters. Characters show various emotions - concern, agreement, surprise. Traditional Indian home setting with cultural elements. Camera cuts between character reactions. Realistic TV series style.')}
                    >
                      Family Discussion Scene
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
                      onClick={() => setPrompt('A 10-second comedy scene of Indian characters in playful banter, with expressive gestures and laughter. Traditional home setting with cultural decorations. Light-hearted interaction between family members. Camera captures the jovial atmosphere. Natural daylight lighting.')}
                    >
                      Comedy Family Scene
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            )}

            {/* Tab 1: Structured Builder */}
            {tabValue === 1 && (
              <Stack spacing={2}>
                {/* Characters & Cast */}
                <Accordion defaultExpanded>
                  <AccordionSummary 
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ minHeight: '44px' }}
                  >
                    <Typography variant="subtitle1" sx={{ fontSize: '1rem' }}>Characters & Cast</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <TextField
                      label="Characters Description"
                      value={components.characters}
                      onChange={e => setComponents(prev => ({ ...prev, characters: e.target.value }))}
                      fullWidth
                      placeholder="e.g., South Indian woman in saree and young man in kurta"
                      helperText="All characters with appearance"
                      multiline
                      rows={2}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  </AccordionDetails>
                </Accordion>

                {/* Scene & Story */}
                <Accordion>
                  <AccordionSummary 
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ minHeight: '44px' }}
                  >
                    <Typography variant="subtitle1" sx={{ fontSize: '1rem' }}>Scene & Story</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <Stack spacing={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel sx={{ fontSize: '0.9rem' }}>Genre</InputLabel>
                        <Select
                          value={components.seriesGenre}
                          onChange={e => setComponents(prev => ({ ...prev, seriesGenre: e.target.value }))}
                          sx={{ fontSize: '0.9rem' }}
                        >
                          <MenuItem value="">Select genre...</MenuItem>
                          <MenuItem value="family drama">Family Drama</MenuItem>
                          <MenuItem value="romantic">Romantic</MenuItem>
                          <MenuItem value="social drama">Social Drama</MenuItem>
                          <MenuItem value="comedy">Comedy</MenuItem>
                          <MenuItem value="thriller">Thriller</MenuItem>
                          <MenuItem value="historical">Historical</MenuItem>
                          <MenuItem value="mythological">Mythological</MenuItem>
                        </Select>
                      </FormControl>

                      <TextField
                        label="Scene Description"
                        value={components.scene}
                        onChange={e => setComponents(prev => ({ ...prev, scene: e.target.value }))}
                        fullWidth
                        placeholder="e.g., Kitchen conversation about family matters"
                        helperText="What's happening?"
                        multiline
                        rows={2}
                        size="small"
                      />

                      <TextField
                        label="Dialogue/Action"
                        value={components.dialogue}
                        onChange={e => setComponents(prev => ({ ...prev, dialogue: e.target.value }))}
                        fullWidth
                        placeholder="e.g., Mother handing plate while talking"
                        helperText="Specific actions"
                        size="small"
                      />
                    </Stack>
                  </AccordionDetails>
                </Accordion>

                {/* Character Interactions */}
                <Accordion>
                  <AccordionSummary 
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ minHeight: '44px' }}
                  >
                    <Typography variant="subtitle1" sx={{ fontSize: '1rem' }}>Interactions</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <Autocomplete
                      freeSolo
                      size="small"
                      options={[
                        'warm family conversation',
                        'emotional discussion',
                        'playful banter',
                        'respectful interaction',
                        'romantic moment',
                        'tension-filled argument',
                        'joyful celebration',
                        'concerned discussion',
                        'traditional greeting'
                      ]}
                      value={components.interactions}
                      onChange={(_, newValue) => setComponents(prev => ({ ...prev, interactions: newValue || '' }))}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Character Interactions"
                          placeholder="How do characters interact?"
                          helperText="Relationship dynamics"
                          size="small"
                        />
                      )}
                    />
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
                          'traditional Indian home',
                          'modern apartment',
                          'village courtyard',
                          'kitchen with steel utensils',
                          'temple setting',
                          'wedding venue',
                          'office workplace',
                          'Indian street',
                          'rural landscape'
                        ]}
                        value={components.setting}
                        onChange={(_, newValue) => setComponents(prev => ({ ...prev, setting: newValue || '' }))}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Setting"
                            placeholder="Where is this scene?"
                            helperText="Location context"
                            size="small"
                          />
                        )}
                      />
                      
                      <TextField
                        label="Cultural Elements"
                        value={components.culturalElements}
                        onChange={e => setComponents(prev => ({ ...prev, culturalElements: e.target.value }))}
                        fullWidth
                        placeholder="e.g., ceiling fans, brass vessels, rangoli"
                        helperText="Indian cultural elements"
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
                          <MenuItem value="natural daylight">Natural Daylight</MenuItem>
                          <MenuItem value="warm tube light">Tube Light</MenuItem>
                          <MenuItem value="oil lamp lighting">Oil Lamp</MenuItem>
                          <MenuItem value="festive diya lighting">Diya Lighting</MenuItem>
                          <MenuItem value="morning sunlight">Morning Sun</MenuItem>
                          <MenuItem value="evening golden light">Golden Hour</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
                  </AccordionDetails>
                </Accordion>

                {/* Camera & Technical */}
                <Accordion>
                  <AccordionSummary 
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ minHeight: '44px' }}
                  >
                    <Typography variant="subtitle1" sx={{ fontSize: '1rem' }}>Camera & Style</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <Stack spacing={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel sx={{ fontSize: '0.9rem' }}>Camera</InputLabel>
                        <Select
                          value={components.camera}
                          onChange={e => setComponents(prev => ({ ...prev, camera: e.target.value }))}
                          sx={{ fontSize: '0.9rem' }}
                        >
                          <MenuItem value="">Select movement...</MenuItem>
                          <MenuItem value="pans across scene">Pan Scene</MenuItem>
                          <MenuItem value="focuses on reactions">Focus Reactions</MenuItem>
                          <MenuItem value="zooms during dialogue">Zoom Dialogue</MenuItem>
                          <MenuItem value="cuts between characters">Cut Characters</MenuItem>
                          <MenuItem value="static wide shot">Static Shot</MenuItem>
                          <MenuItem value="tracks movement">Track Movement</MenuItem>
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
                          <MenuItem value="realistic TV series">TV Realistic</MenuItem>
                          <MenuItem value="cinematic dramatic">Cinematic</MenuItem>
                          <MenuItem value="documentary natural">Documentary</MenuItem>
                          <MenuItem value="traditional Indian cinema">Traditional</MenuItem>
                          <MenuItem value="modern web series">Web Series</MenuItem>
                          <MenuItem value="vintage film">Vintage</MenuItem>
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

            {/* Tab 2: Saved Prompts */}
            {tabValue === 2 && (
              <Stack spacing={2}>
                {/* Save Current Prompt */}
                <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontSize: '0.9rem' }}>Save Current</Typography>
                  <Stack spacing={1}>
                    <TextField
                      label="Prompt Name"
                      value={promptName}
                      onChange={e => setPromptName(e.target.value)}
                      size="small"
                      placeholder="e.g., Kitchen Scene Template"
                      fullWidth
                    />
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<SaveIcon />}
                      onClick={savePrompt}
                      disabled={!promptName.trim() || !prompt.trim()}
                      fullWidth
                      sx={{ py: 1.5 }}
                    >
                      Save Template
                    </Button>
                  </Stack>
                </Box>

                <Divider />

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
                    No saved templates yet. Create and save your first template!
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
