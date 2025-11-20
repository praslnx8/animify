import {
  Visibility as VisibilityIcon,
  AutoAwesome as AutoAwesomeIcon
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
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { generateVideo } from "../api/generateVideo";
import animateConfig from '../config/transform_config.json';
import { MediaItem } from "../models/MediaItem";
import { MediaType } from "../models/MediaType";

interface PhotoAnimateDialogProps {
  mediaItem: MediaItem;
  open: boolean;
  onClose: () => void;
  addMediaItem: (mediaItem: MediaItem) => void;
  updateMediaItem: (mediaItem: MediaItem) => void;
  initialPrompt?: string;
}

const PhotoAnimateDialog: React.FC<PhotoAnimateDialogProps> = ({ mediaItem, open, onClose, addMediaItem, updateMediaItem, initialPrompt }) => {
  const [prompt, setPrompt] = useState(initialPrompt || mediaItem.prompt || "");
  const [tabValue, setTabValue] = useState(0);
  const [numberOfVideos, setNumberOfVideos] = useState(1);
  const [convertPrompt, setConvertPrompt] = useState(true);

  // Template Builder State
  const [selectedSubject, setSelectedSubject] = useState("single");
  const [customSubject, setCustomSubject] = useState("");
  const [selectedAction, setSelectedAction] = useState("none");
  const [selectedEnvironment, setSelectedEnvironment] = useState("none");
  const [selectedCamera, setSelectedCamera] = useState("none");
  const [selectedStyle, setSelectedStyle] = useState("cinematic");
  const [builtPrompt, setBuiltPrompt] = useState("");

  // Multi-action state
  const [enableMultiAction, setEnableMultiAction] = useState(false);
  const [secondAction, setSecondAction] = useState("none");
  const [sequenceConnector, setSequenceConnector] = useState("then");

  // Individual person actions (for multi-person scenarios)
  const [enableIndividualActions, setEnableIndividualActions] = useState(false);
  const [personAAction, setPersonAAction] = useState("none");
  const [personBAction, setPersonBAction] = useState("none");

  // Custom inputs for flexibility
  const [customAction, setCustomAction] = useState("");
  const [customSecondAction, setCustomSecondAction] = useState("");
  const [customPersonAAction, setCustomPersonAAction] = useState("");
  const [customPersonBAction, setCustomPersonBAction] = useState("");
  const [customEnvironment, setCustomEnvironment] = useState("");
  const [customCamera, setCustomCamera] = useState("");
  const [customStyle, setCustomStyle] = useState("");

  const templateConfig = animateConfig.templateBuilder;

  // Update prompt when initialPrompt or mediaItem changes
  useEffect(() => {
    setPrompt(initialPrompt || mediaItem.prompt || "");
  }, [initialPrompt, mediaItem.prompt, open]);

  // Build prompt from template selections
  useEffect(() => {
    const parts: string[] = [];

    // Subject
    const subjectOption = templateConfig.subjects.find(s => s.id === selectedSubject);
    if (subjectOption) {
      if (selectedSubject === "custom" && customSubject.trim()) {
        parts.push(customSubject.trim());
      } else if (subjectOption.value) {
        parts.push(subjectOption.value);
      }
    }

    // Action logic
    const isMultiple = selectedSubject === "couple" || selectedSubject === "group";
    const actionList = isMultiple ? templateConfig.actions.multiple : templateConfig.actions.single;

    if (isMultiple && enableIndividualActions) {
      // Individual person actions (Person A does X while Person B does Y)
      const actionAParts: string[] = [];
      const actionBParts: string[] = [];

      const actionAOption = actionList.find(a => a.id === personAAction);
      const actionBOption = actionList.find(a => a.id === personBAction);

      // Person A action (use custom if selected)
      if (personAAction === "custom" && customPersonAAction.trim()) {
        actionAParts.push("first person");
        actionAParts.push(customPersonAAction.trim());
      } else if (actionAOption?.value) {
        actionAParts.push("first person");
        actionAParts.push(actionAOption.value);
      }

      // Person B action (use custom if selected)
      if (personBAction === "custom" && customPersonBAction.trim()) {
        actionBParts.push("second person");
        actionBParts.push(customPersonBAction.trim());
      } else if (actionBOption?.value) {
        actionBParts.push("second person");
        actionBParts.push(actionBOption.value);
      }

      if (actionAParts.length > 0 && actionBParts.length > 0) {
        parts.push(`${actionAParts.join(" ")} while ${actionBParts.join(" ")}`);
      } else if (actionAParts.length > 0) {
        parts.push(actionAParts.join(" "));
      } else if (actionBParts.length > 0) {
        parts.push(actionBParts.join(" "));
      }
    } else if (enableMultiAction) {
      // Sequential actions (person does X then does Y)
      const action1Option = actionList.find(a => a.id === selectedAction);
      const action2Option = actionList.find(a => a.id === secondAction);
      const connector = templateConfig.sequenceConnectors.find(c => c.id === sequenceConnector);

      const actionParts: string[] = [];
      
      // First action (use custom if selected)
      if (selectedAction === "custom" && customAction.trim()) {
        actionParts.push(customAction.trim());
      } else if (action1Option?.value) {
        actionParts.push(action1Option.value);
      }

      // Second action (use custom if selected)
      if (secondAction === "custom" && customSecondAction.trim()) {
        if (connector?.value) {
          actionParts.push(connector.value);
          actionParts.push(customSecondAction.trim());
        }
      } else if (action2Option?.value && connector?.value) {
        actionParts.push(connector.value);
        actionParts.push(action2Option.value);
      }

      if (actionParts.length > 0) {
        parts.push(actionParts.join(" "));
      }
    } else {
      // Single action (use custom if selected)
      if (selectedAction === "custom" && customAction.trim()) {
        parts.push(customAction.trim());
      } else {
        const actionOption = actionList.find(a => a.id === selectedAction);
        if (actionOption?.value) {
          parts.push(actionOption.value);
        }
      }
    }

    // Environment (use custom if selected)
    if (selectedEnvironment === "custom" && customEnvironment.trim()) {
      parts.push(customEnvironment.trim());
    } else {
      const envOption = templateConfig.environments.find(e => e.id === selectedEnvironment);
      if (envOption?.value) {
        parts.push(envOption.value);
      }
    }

    // Camera (use custom if selected)
    if (selectedCamera === "custom" && customCamera.trim()) {
      parts.push(customCamera.trim());
    } else {
      const cameraOption = templateConfig.cameraMovements.find(c => c.id === selectedCamera);
      if (cameraOption?.value) {
        parts.push(cameraOption.value);
      }
    }

    // Style (use custom if selected)
    if (selectedStyle === "custom" && customStyle.trim()) {
      parts.push(customStyle.trim());
    } else {
      const styleOption = templateConfig.styles.find(s => s.id === selectedStyle);
      if (styleOption?.value) {
        parts.push(styleOption.value);
      }
    }

    setBuiltPrompt(parts.join(", "));
  }, [selectedSubject, customSubject, selectedAction, selectedEnvironment, selectedCamera, selectedStyle, 
      enableMultiAction, secondAction, sequenceConnector, enableIndividualActions, personAAction, personBAction,
      customAction, customSecondAction, customPersonAAction, customPersonBAction, customEnvironment, customCamera, customStyle]);

  const loadSavedPrompt = (savedPrompt: string) => {
    setPrompt(savedPrompt);
  };

  const useBuiltPrompt = () => {
    if (builtPrompt.trim()) {
      setPrompt(builtPrompt);
      setTabValue(0); // Switch to Quick tab to show the prompt
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create multiple videos based on numberOfVideos
    for (let i = 0; i < numberOfVideos; i++) {
      const videoMediaItem: MediaItem = {
        id: `${Date.now()}-${i}`,
        type: MediaType.Video,
        loading: true,
        prompt,
        parent: mediaItem,
        createdAt: Date.now() + i,
      };
      addMediaItem(videoMediaItem);
      
      // Generate video asynchronously (don't await to create all at once)
      (async () => {
        try {
          if (!mediaItem.url) {
            updateMediaItem({ ...videoMediaItem, loading: false, error: "Image URL is missing" });
            return;
          }
          const result = await generateVideo({ image_url: mediaItem.url, prompt, convertPrompt });
          if (result.videoUrl) {
            updateMediaItem({ ...videoMediaItem, loading: false, url: result.videoUrl, prompt: result.convertedPrompt || prompt });
          } else {
            updateMediaItem({ ...videoMediaItem, loading: false, error: result.error || "Failed to generate video" });
          }
        } catch (err: any) {
          updateMediaItem({ ...videoMediaItem, loading: false, error: err.message || "An error occurred" });
        }
      })();
    }
    
    // Close dialog after initiating all video generations
    onClose();
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
              <Tab label="Template" icon={<AutoAwesomeIcon sx={{ fontSize: '1rem' }} />} iconPosition="start" />
              <Tab label="Saved" />
            </Tabs>

            {/* Tab 0: Free Text Mode */}
            {tabValue === 0 && (
              <Stack spacing={2}>
                <TextField
                  label="Number of Videos"
                  type="number"
                  value={numberOfVideos}
                  onChange={e => setNumberOfVideos(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                  fullWidth
                  size="small"
                  inputProps={{ min: 1, max: 10 }}
                  helperText="Generate 1-10 videos (each will have slight variations)"
                />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                    Convert prompt using chatbot
                  </Typography>
                  <Switch
                    checked={convertPrompt}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConvertPrompt(e.target.checked)}
                    size="small"
                  />
                </Box>
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

            {/* Tab 1: Template Builder */}
            {tabValue === 1 && (
              <Stack spacing={2}>
                <TextField
                  label="Number of Videos"
                  type="number"
                  value={numberOfVideos}
                  onChange={e => setNumberOfVideos(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                  fullWidth
                  size="small"
                  inputProps={{ min: 1, max: 10 }}
                  helperText="Generate 1-10 videos (each will have slight variations)"
                />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                    Convert prompt using chatbot
                  </Typography>
                  <Switch
                    checked={convertPrompt}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConvertPrompt(e.target.checked)}
                    size="small"
                  />
                </Box>
                {/* Subject Selection */
                <FormControl fullWidth size="small">
                  <InputLabel>Number of People</InputLabel>
                  <Select
                    value={selectedSubject}
                    label="Number of People"
                    onChange={e => setSelectedSubject(e.target.value)}
                  >
                    {templateConfig.subjects.map(subject => (
                      <MenuItem key={subject.id} value={subject.id}>
                        {subject.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>}

                {/* Custom Subject Input */}
                {selectedSubject === "custom" && (
                  <TextField
                    label="Custom Subject"
                    value={customSubject}
                    onChange={e => setCustomSubject(e.target.value)}
                    fullWidth
                    size="small"
                    placeholder="e.g., family of four, children playing"
                    helperText="Describe who is in the photo"
                  />
                )}

                {/* Multi-Person: Choose action mode */}
                {(selectedSubject === "couple" || selectedSubject === "group") && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      fullWidth
                      variant={!enableIndividualActions ? "contained" : "outlined"}
                      onClick={() => {
                        setEnableIndividualActions(false);
                        setEnableMultiAction(false);
                      }}
                      size="small"
                      sx={{ fontSize: '0.75rem' }}
                    >
                      Together
                    </Button>
                    <Button
                      fullWidth
                      variant={enableIndividualActions ? "contained" : "outlined"}
                      onClick={() => {
                        setEnableIndividualActions(true);
                        setEnableMultiAction(false);
                      }}
                      size="small"
                      sx={{ fontSize: '0.75rem' }}
                    >
                      Individual Actions
                    </Button>
                  </Box>
                )}

                {/* Action Selection - Together or Individual */}
                {(selectedSubject === "couple" || selectedSubject === "group") && enableIndividualActions ? (
                  <>
                    <FormControl fullWidth size="small">
                      <InputLabel>First Person Action</InputLabel>
                      <Select
                        value={personAAction}
                        label="First Person Action"
                        onChange={e => setPersonAAction(e.target.value)}
                      >
                        {templateConfig.actions.single.map(action => (
                          <MenuItem key={action.id} value={action.id}>
                            {action.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {personAAction === "custom" && (
                      <TextField
                        label="Custom Action for First Person"
                        value={customPersonAAction}
                        onChange={e => setCustomPersonAAction(e.target.value)}
                        fullWidth
                        size="small"
                        placeholder="e.g., holding a product, pointing at sky"
                        helperText="Describe what the first person does"
                      />
                    )}
                    <FormControl fullWidth size="small">
                      <InputLabel>Second Person Action</InputLabel>
                      <Select
                        value={personBAction}
                        label="Second Person Action"
                        onChange={e => setPersonBAction(e.target.value)}
                      >
                        {templateConfig.actions.single.map(action => (
                          <MenuItem key={action.id} value={action.id}>
                            {action.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {personBAction === "custom" && (
                      <TextField
                        label="Custom Action for Second Person"
                        value={customPersonBAction}
                        onChange={e => setCustomPersonBAction(e.target.value)}
                        fullWidth
                        size="small"
                        placeholder="e.g., clapping hands, looking amazed"
                        helperText="Describe what the second person does"
                      />
                    )}
                  </>
                ) : (
                  <>
                    <FormControl fullWidth size="small">
                      <InputLabel>Action/Movement</InputLabel>
                      <Select
                        value={selectedAction}
                        label="Action/Movement"
                        onChange={e => setSelectedAction(e.target.value)}
                      >
                        {(selectedSubject === "couple" || selectedSubject === "group"
                          ? templateConfig.actions.multiple
                          : templateConfig.actions.single
                        ).map(action => (
                          <MenuItem key={action.id} value={action.id}>
                            {action.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Custom action input */}
                    {selectedAction === "custom" && (
                      <TextField
                        label="Custom Action"
                        value={customAction}
                        onChange={e => setCustomAction(e.target.value)}
                        fullWidth
                        size="small"
                        placeholder="e.g., drinking coffee, checking phone, adjusting sunglasses"
                        helperText="Describe the action you want"
                      />
                    )}

                    {/* Multi-Action Toggle (only for single person or together mode) */}
                    {selectedAction !== "none" && !enableIndividualActions && (
                      <Box>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => setEnableMultiAction(!enableMultiAction)}
                          size="small"
                          sx={{ fontSize: '0.75rem' }}
                        >
                          {enableMultiAction ? "Remove Second Action" : "+ Add Sequential Action"}
                        </Button>
                      </Box>
                    )}

                    {/* Sequential Action Builder */}
                    {enableMultiAction && (
                      <Paper elevation={0} sx={{ p: 2, bgcolor: 'action.hover', border: 1, borderColor: 'divider' }}>
                        <Typography variant="subtitle2" sx={{ fontSize: '0.85rem', mb: 1.5, fontWeight: 600 }}>
                          Sequential Action
                        </Typography>
                        <Stack spacing={1.5}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Connector</InputLabel>
                            <Select
                              value={sequenceConnector}
                              label="Connector"
                              onChange={e => setSequenceConnector(e.target.value)}
                            >
                              {templateConfig.sequenceConnectors.map(conn => (
                                <MenuItem key={conn.id} value={conn.id}>
                                  {conn.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <FormControl fullWidth size="small">
                            <InputLabel>Second Action</InputLabel>
                            <Select
                              value={secondAction}
                              label="Second Action"
                              onChange={e => setSecondAction(e.target.value)}
                            >
                              {(selectedSubject === "couple" || selectedSubject === "group"
                                ? templateConfig.actions.multiple
                                : templateConfig.actions.single
                              ).map(action => (
                                <MenuItem key={action.id} value={action.id}>
                                  {action.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          {secondAction === "custom" && (
                            <TextField
                              label="Custom Second Action"
                              value={customSecondAction}
                              onChange={e => setCustomSecondAction(e.target.value)}
                              fullWidth
                              size="small"
                              placeholder="e.g., spinning around, looking back"
                              helperText="Describe the second action"
                            />
                          )}
                        </Stack>
                      </Paper>
                    )}
                  </>
                )}

                {/* Environment Selection */}
                <FormControl fullWidth size="small">
                  <InputLabel>Environment/Effects</InputLabel>
                  <Select
                    value={selectedEnvironment}
                    label="Environment/Effects"
                    onChange={e => setSelectedEnvironment(e.target.value)}
                  >
                    {templateConfig.environments.map(env => (
                      <MenuItem key={env.id} value={env.id}>
                        {env.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {selectedEnvironment === "custom" && (
                  <TextField
                    label="Custom Environment"
                    value={customEnvironment}
                    onChange={e => setCustomEnvironment(e.target.value)}
                    fullWidth
                    size="small"
                    placeholder="e.g., confetti falling, neon signs glowing, butterflies flying"
                    helperText="Describe the environment or visual effects"
                  />
                )}

                {/* Camera Movement Selection */}
                <FormControl fullWidth size="small">
                  <InputLabel>Camera Movement</InputLabel>
                  <Select
                    value={selectedCamera}
                    label="Camera Movement"
                    onChange={e => setSelectedCamera(e.target.value)}
                  >
                    {templateConfig.cameraMovements.map(camera => (
                      <MenuItem key={camera.id} value={camera.id}>
                        {camera.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {selectedCamera === "custom" && (
                  <TextField
                    label="Custom Camera Movement"
                    value={customCamera}
                    onChange={e => setCustomCamera(e.target.value)}
                    fullWidth
                    size="small"
                    placeholder="e.g., quick snap zoom, dutch angle tilt, tracking shot"
                    helperText="Describe the camera technique"
                  />
                )}

                {/* Style Selection */}
                <FormControl fullWidth size="small">
                  <InputLabel>Video Style</InputLabel>
                  <Select
                    value={selectedStyle}
                    label="Video Style"
                    onChange={e => setSelectedStyle(e.target.value)}
                  >
                    {templateConfig.styles.map(style => (
                      <MenuItem key={style.id} value={style.id}>
                        {style.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {selectedStyle === "custom" && (
                  <TextField
                    label="Custom Style"
                    value={customStyle}
                    onChange={e => setCustomStyle(e.target.value)}
                    fullWidth
                    size="small"
                    placeholder="e.g., high fashion, music video, slow motion epic"
                    helperText="Describe the visual style or mood"
                  />
                )}

                {/* Generated Prompt Preview */}
                {builtPrompt && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: 'action.hover',
                      borderRadius: 1,
                      border: 1,
                      borderColor: 'divider'
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontSize: '0.85rem', mb: 1, fontWeight: 600 }}>
                      Generated Prompt:
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary', lineHeight: 1.5 }}>
                      {builtPrompt}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={useBuiltPrompt}
                      sx={{ mt: 1.5, fontSize: '0.75rem' }}
                      fullWidth
                    >
                      Use This Prompt
                    </Button>
                  </Paper>
                )}
              </Stack>
            )}

            {/* Tab 2: Saved Prompts */}
            {tabValue === 2 && (
              <Stack spacing={2}>
                <TextField
                  label="Number of Videos"
                  type="number"
                  value={numberOfVideos}
                  onChange={e => setNumberOfVideos(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                  fullWidth
                  size="small"
                  inputProps={{ min: 1, max: 10 }}
                  helperText="Generate 1-10 videos (each will have slight variations)"
                />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                    Convert prompt using chatbot
                  </Typography>
                  <Switch
                    checked={convertPrompt}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConvertPrompt(e.target.checked)}
                    size="small"
                  />
                </Box>
                {/* Saved Prompts List */}
                <Typography variant="subtitle2" sx={{ fontSize: '0.9rem' }}>
                  Saved Templates ({animateConfig.animations.length})
                </Typography>
                {animateConfig.animations.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{
                    textAlign: 'center',
                    py: 3,
                    fontSize: '0.85rem'
                  }}>
                    No saved templates yet.
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {animateConfig.animations.map((saved) => (
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
            Generate {numberOfVideos > 1 ? `${numberOfVideos} Videos` : 'Video'}
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
  convertPrompt = true,
}: {
  parentMediaItem: MediaItem;
  prompt: string;
  addMediaItem: (item: MediaItem) => void;
  updateMediaItem: (item: MediaItem) => void;
  convertPrompt?: boolean;
}) {
  const videoMediaItem: MediaItem = {
    id: Date.now().toString(),
    type: MediaType.Video,
    loading: true,
    prompt,
    parent: parentMediaItem,
    createdAt: Date.now(),
  };
  addMediaItem(videoMediaItem);
  try {
    if (!parentMediaItem.url) {
      updateMediaItem({ ...videoMediaItem, loading: false, error: 'Image URL is missing' });
      return;
    }
    const result = await generateVideo({ image_url: parentMediaItem.url, prompt, convertPrompt });
    if (result.videoUrl) {
      updateMediaItem({ ...videoMediaItem, loading: false, url: result.videoUrl, prompt: result.convertedPrompt || prompt });
    } else {
      updateMediaItem({ ...videoMediaItem, loading: false, error: result.error || 'Failed to generate video' });
    }
  } catch (err: any) {
    updateMediaItem({ ...videoMediaItem, loading: false, error: err.message || 'An error occurred' });
  }
}

export default PhotoAnimateDialog;
