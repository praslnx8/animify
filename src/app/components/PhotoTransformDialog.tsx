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
  useMediaQuery,
  useTheme
} from "@mui/material";
import React, { useState } from "react";
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

const PhotoTransformDialog: React.FC<PhotoTransformDialogProps> = ({ mediaItem, open, onClose, addMediaItem, updateMediaItem }) => {
  const [prompt, setPrompt] = useState(mediaItem.prompt || "");
  const [modelName, setModelName] = useState(mediaItem.parent?.model_name || "base");
  const [style, setStyle] = useState(mediaItem.parent?.style || "realistic");
  const [gender, setGender] = useState(mediaItem.parent?.gender || "woman");
  const [bodyType, setBodyType] = useState(mediaItem.parent?.body_type || "lean");
  const [skinColor, setSkinColor] = useState(mediaItem.parent?.skin_color || "tanned");
  const [autoDetectHairColor, setAutoDetectHairColor] = useState<boolean>(mediaItem.parent?.auto_detect_hair_color || false);
  const [nsfwPolicy, setNsfwPolicy] = useState(mediaItem.parent?.nsfw_policy || "allow");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleAccordionChange = () => {
    setExpanded(!expanded);
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
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 2,
          maxHeight: '100%',
        }
      }}
    >
      <DialogTitle sx={{
        pb: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        Transform Photo
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2.5}>
            <TextField
              label={<>
                Transformation Description
                <Box component="span" sx={{ ml: 1, verticalAlign: 'middle' }}>
                  <Typography component="span" variant="caption" color="text.secondary">
                    <span title="Describe the subject, style, setting, mood, and details for best results. E.g. 'A portrait of a young woman in a fantasy forest, anime style, soft lighting, intricate details.'">🛈</span>
                  </Typography>
                </Box>
              </>}
              placeholder="E.g. A portrait of a young woman in a fantasy forest, anime style, soft lighting, intricate details."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              fullWidth
              required
              autoFocus
              multiline
              rows={2}
              variant="outlined"
              helperText="Describe the subject, style, setting, mood, and details for best results."
              InputProps={{
                sx: {
                  borderRadius: 1.5
                }
              }}
            />

            {/* Prompt Helper Section */}
            <Box sx={{ bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5, p: 2, mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Prompt Helper
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                For best results, include:
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  <li>Subject (e.g. "a young woman")</li>
                  <li>Setting or background (e.g. "in a fantasy forest")</li>
                  <li>Lighting, mood, or color (e.g. "soft lighting", "vibrant colors")</li>
                  <li>Details (e.g. "intricate details", "highly detailed eyes")</li>
                </ul>
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setPrompt('South Indian woman wearing a traditional cotton nighty, ankle-length, floral print, short sleeves, loose-fitting, standing in a tiled house corridor, realistic, Indian home setting')}
                >
                  Nighty
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setPrompt('Point of view from a South Indian man sitting down, looking slightly upward at a South Indian woman in her 40s wearing a traditional floral cotton nighty, standing and slightly bending forward to offer a stainless steel tumbler of tea with one hand, realistic indoor lighting, tiled floor, simple South Indian home interior, camera angle from eye level of the man, the woman is in focus, no sitting pose')}
                >
                  Aunty giving tea
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setPrompt('A South Indian middle-aged woman wearing a loose-fitting cotton floral nighty, standing beside a young adult man in casual Indian homewear (t-shirt and lungi), both inside a small tiled South Indian house, chatting casually in the kitchen while she helps him with something on the counter, stainless steel utensils on the shelf, window light coming in, ceiling fan above, realistic documentary-style scene, warm and friendly atmosphere, no modern furniture, no Western dress')}
                >
                  With neighbour
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setPrompt('A South Indian aunty in a maroon floral nighty helping her young male neighbor with documents at a dining table, ceiling fan above, framed family photos in background, stainless steel plate on table, calm and realistic setting')}
                >
                  Helping document
                </Button>
              </Stack>
            </Box>

            <Accordion
              expanded={expanded}
              onChange={handleAccordionChange}
              sx={{
                boxShadow: 'none',
                '&:before': {
                  display: 'none',
                },
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1.5,
                mb: 1
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="advanced-settings-content"
                id="advanced-settings-header"
                sx={{
                  borderRadius: expanded ? '8px 8px 0 0' : 1.5
                }}
              >
                <Typography>Advanced Settings</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2.5}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Model Settings
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
                    <Box sx={{ flex: 1, width: '100%' }}>
                      <TextField
                        select
                        label="Model Name"
                        value={modelName}
                        onChange={e => setModelName(e.target.value)}
                        fullWidth
                      >
                        <MenuItem value="base">Base Model</MenuItem>
                        <MenuItem value="large">Large Model</MenuItem>
                      </TextField>
                    </Box>
                    <Box sx={{ flex: 1, width: '100%' }}>
                      <TextField
                        select
                        label="Style"
                        value={style}
                        onChange={e => setStyle(e.target.value)}
                        fullWidth
                      >
                        <MenuItem value="realistic">Realistic</MenuItem>
                        <MenuItem value="anime">Anime</MenuItem>
                      </TextField>
                    </Box>
                  </Box>

                  <Typography variant="subtitle2" color="text.secondary">
                    Person Settings
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
                    <Box sx={{ flex: 1, width: '100%' }}>
                      <TextField
                        select
                        label="Gender"
                        value={gender}
                        onChange={e => setGender(e.target.value)}
                        fullWidth
                      >
                        <MenuItem value="man">Man</MenuItem>
                        <MenuItem value="woman">Woman</MenuItem>
                      </TextField>
                    </Box>
                    <Box sx={{ flex: 1, width: '100%' }}>
                      <TextField
                        select
                        label="Body Type"
                        value={bodyType}
                        onChange={e => setBodyType(e.target.value)}
                        fullWidth
                      >
                        <MenuItem value="skinny">Skinny</MenuItem>
                        <MenuItem value="lean">Lean</MenuItem>
                        <MenuItem value="muscular">Muscular</MenuItem>
                        <MenuItem value="curvy">Curvy</MenuItem>
                        <MenuItem value="heavyset">Heavyset</MenuItem>
                      </TextField>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
                    <Box sx={{ flex: 1, width: '100%' }}>
                      <TextField
                        select
                        label="Skin Color"
                        value={skinColor}
                        onChange={e => setSkinColor(e.target.value)}
                        fullWidth
                      >
                        <MenuItem value="pale">Pale</MenuItem>
                        <MenuItem value="white">White</MenuItem>
                        <MenuItem value="tanned">Tanned</MenuItem>
                      </TextField>
                    </Box>
                    <Box sx={{ flex: 1, width: '100%' }}>
                      <TextField
                        select
                        label="NSFW Policy"
                        value={nsfwPolicy}
                        onChange={e => setNsfwPolicy(e.target.value)}
                        fullWidth
                      >
                        <MenuItem value="blur">Blur</MenuItem>
                        <MenuItem value="filter">Filter</MenuItem>
                        <MenuItem value="allow">Allow</MenuItem>
                      </TextField>
                    </Box>
                  </Box>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoDetectHairColor}
                        onChange={e => setAutoDetectHairColor(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Auto-detect hair color from photo"
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 2, justifyContent: 'space-between' }}>
          <Button
            onClick={onClose}
            variant="outlined"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!prompt || isSubmitting}
            color="primary"
          >
            {isSubmitting ? "Generating..." : "Generate Image"}
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
