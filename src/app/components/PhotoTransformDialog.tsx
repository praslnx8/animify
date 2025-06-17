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
  const [modelName, setModelName] = useState("base");
  const [style, setStyle] = useState("realistic");
  const [gender, setGender] = useState("man");
  const [bodyType, setBodyType] = useState("lean");
  const [skinColor, setSkinColor] = useState("pale");
  const [autoDetectHairColor, setAutoDetectHairColor] = useState(true);
  const [nsfwPolicy, setNsfwPolicy] = useState("allow");
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
      prompt: prompt
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
              label="Transformation Description"
              placeholder="Describe how you want to transform this photo"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              fullWidth
              required
              autoFocus
              multiline
              rows={2}
              variant="outlined"
              helperText="Be specific about the style, setting, outfit, etc."
              InputProps={{
                sx: {
                  borderRadius: 1.5
                }
              }}
            />

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

export default PhotoTransformDialog;
