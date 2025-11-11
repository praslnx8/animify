'use client';

import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    RestoreFromTrash as RestoreIcon,
    Settings as SettingsIcon,
    Home as HomeIcon,
    Chat as ChatIcon
} from '@mui/icons-material';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    AppBar,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Divider,
    Fab,
    FormControl,
    FormControlLabel,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Switch,
    TextField,
    Toolbar,
    Typography,
    useTheme,
    useMediaQuery,
    Snackbar,
    Alert
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChatConfig, BotProfile, ChatSettings, ImageSettings } from '../models/ChatConfig';
import { ChatConfigManager } from '../utils/ChatConfigManager';
import { useChatConfig } from '../contexts/ChatConfigContext';
import { Sender } from '../models/Sender';
import { uploadBase64Image } from "../api/uploadBase64Image";

export default function ConfigPage() {
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { config, updateConfig, resetConfig, saveConfig, loading } = useChatConfig();
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    useEffect(() => {
        // Config is managed by the context, no need to load here
    }, []);

    const handleSaveConfig = () => {
        saveConfig();
        setSnackbar({ open: true, message: 'Configuration saved successfully!', severity: 'success' });
    };

    const handleResetConfig = () => {
        resetConfig();
        setSnackbar({ open: true, message: 'Configuration reset to defaults!', severity: 'success' });
    };

    const updateBotProfile = (senderKey: string, field: keyof BotProfile, value: any) => {
        if (!config) return;
        
        const newConfig = {
            ...config,
            botProfiles: {
                ...config.botProfiles,
                [senderKey]: {
                    ...config.botProfiles[senderKey],
                    [field]: value
                }
            }
        };
        updateConfig(newConfig);
    };

    const updateChatSettings = (senderKey: string, field: keyof ChatSettings, value: any) => {
        if (!config) return;
        
        const newConfig = {
            ...config,
            chatSettings: {
                ...config.chatSettings,
                [senderKey]: {
                    ...config.chatSettings[senderKey],
                    [field]: value
                }
            }
        };
        updateConfig(newConfig);
    };

    const updateImageSettings = (senderKey: string, field: keyof ImageSettings, value: any) => {
        if (!config) return;
        
        const newConfig = {
            ...config,
            imageSettings: {
                ...config.imageSettings,
                [senderKey]: {
                    ...config.imageSettings[senderKey],
                    [field]: value
                }
            }
        };
        updateConfig(newConfig);
    };

    const addTask = (senderKey: string) => {
        if (!config) return;
        
        const newConfig = {
            ...config,
            chatSettings: {
                ...config.chatSettings,
                [senderKey]: {
                    ...config.chatSettings[senderKey],
                    tasks: [...config.chatSettings[senderKey].tasks, '']
                }
            }
        };
        updateConfig(newConfig);
    };

    const updateTask = (senderKey: string, index: number, value: string) => {
        if (!config) return;
        
        const newTasks = [...config.chatSettings[senderKey].tasks];
        newTasks[index] = value;
        const newConfig = {
            ...config,
            chatSettings: {
                ...config.chatSettings,
                [senderKey]: {
                    ...config.chatSettings[senderKey],
                    tasks: newTasks
                }
            }
        };
        updateConfig(newConfig);
    };

    const removeTask = (senderKey: string, index: number) => {
        if (!config) return;
        
        const newConfig = {
            ...config,
            chatSettings: {
                ...config.chatSettings,
                [senderKey]: {
                    ...config.chatSettings[senderKey],
                    tasks: config.chatSettings[senderKey].tasks.filter((_, i) => i !== index)
                }
            }
        };
        updateConfig(newConfig);
    };

    const addExampleMessage = (senderKey: string) => {
        if (!config) return;
        
        const newConfig = {
            ...config,
            botProfiles: {
                ...config.botProfiles,
                [senderKey]: {
                    ...config.botProfiles[senderKey],
                    example_messages: [...config.botProfiles[senderKey].example_messages, '']
                }
            }
        };
        updateConfig(newConfig);
    };

    const updateExampleMessage = (senderKey: string, index: number, value: string) => {
        if (!config) return;
        
        const newMessages = [...config.botProfiles[senderKey].example_messages];
        newMessages[index] = value;
        const newConfig = {
            ...config,
            botProfiles: {
                ...config.botProfiles,
                [senderKey]: {
                    ...config.botProfiles[senderKey],
                    example_messages: newMessages
                }
            }
        };
        updateConfig(newConfig);
    };

    const removeExampleMessage = (senderKey: string, index: number) => {
        if (!config) return;
        
        const newConfig = {
            ...config,
            botProfiles: {
                ...config.botProfiles,
                [senderKey]: {
                    ...config.botProfiles[senderKey],
                    example_messages: config.botProfiles[senderKey].example_messages.filter((_, i) => i !== index)
                }
            }
        };
        updateConfig(newConfig);
    };

    const handleImageUpload = (senderKey: string, updateImageSettings: Function) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async (event: any) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = async () => {
                    const base64 = reader.result?.toString().split(",")[1];
                    if (base64) {
                        try {
                            const imageUrl = await uploadBase64Image(base64);
                            updateImageSettings(senderKey, "identity_image_url", imageUrl);
                        } catch (error) {
                            console.error("Image upload failed:", error);
                        }
                    }
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    if (loading || !config) {
        return (
            <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'background.default' }}>
                <AppBar position="sticky" color="default">
                    <Toolbar>
                        <Avatar sx={{ mr: 1 }}><SettingsIcon color="primary" /></Avatar>
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>Configuration</Typography>
                        <IconButton onClick={() => router.push('/')} color="primary">
                            <HomeIcon />
                        </IconButton>
                        <IconButton onClick={() => router.push('/chat')} color="primary">
                            <ChatIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                
                <Container maxWidth="md" sx={{ py: 4, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography>Loading configuration...</Typography>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'background.default' }}>
            <AppBar position="sticky" color="default">
                <Toolbar>
                    <Avatar sx={{ mr: 1 }}><SettingsIcon color="primary" /></Avatar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>Configuration</Typography>
                    <IconButton onClick={() => router.push('/')} color="primary">
                        <HomeIcon />
                    </IconButton>
                    <IconButton onClick={() => router.push('/chat')} color="primary">
                        <ChatIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            
            <Container maxWidth="md" sx={{ py: 2, pb: 10, flex: 1, overflowY: 'auto' }}>
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <SettingsIcon color="primary" />
                    <Typography variant="h4" component="h1">
                        Chat Configuration
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Customize your chat experience by modifying bot profiles, chat settings, and image generation parameters.
                </Typography>
                
                <Box display="flex" gap={2} flexWrap="wrap">
                    <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSaveConfig}
                        color="primary"
                    >
                        Save Configuration
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<RestoreIcon />}
                        onClick={handleResetConfig}
                        color="warning"
                    >
                        Reset to Defaults
                    </Button>
                </Box>
            </Paper>

            {Object.entries(config.botProfiles).map(([senderKey, profile]) => (
                <Card key={senderKey} sx={{ mb: 3 }} elevation={2}>
                    <CardContent>
                        <Typography variant="h5" gutterBottom color="primary">
                            {senderKey} Configuration
                        </Typography>
                        
                        {/* Bot Profile Section */}
                        <Accordion defaultExpanded>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                                <Typography variant="h6">Bot Profile</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box display="flex" flexDirection="column" gap={2}>
                                    <TextField
                                        fullWidth
                                        label="Id"
                                        value={profile.id}
                                        onChange={(e) => updateBotProfile(senderKey, 'id', e.target.value)}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Name"
                                        value={profile.name}
                                        onChange={(e) => updateBotProfile(senderKey, 'name', e.target.value)}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Description"
                                        multiline
                                        rows={2}
                                        value={profile.description}
                                        onChange={(e) => updateBotProfile(senderKey, 'description', e.target.value)}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Appearance"
                                        multiline
                                        rows={2}
                                        value={profile.appearance}
                                        onChange={(e) => updateBotProfile(senderKey, 'appearance', e.target.value)}
                                    />
                                    <FormControl fullWidth>
                                        <InputLabel>Pronoun</InputLabel>
                                        <Select
                                            value={profile.pronoun}
                                            label="Pronoun"
                                            onChange={(e) => updateBotProfile(senderKey, 'pronoun', e.target.value)}
                                        >
                                            <MenuItem value="he/him">He/Him</MenuItem>
                                            <MenuItem value="she/her">She/Her</MenuItem>
                                            <MenuItem value="they/them">They/Them</MenuItem>
                                        </Select>
                                    </FormControl>
                                    
                                    <Box>
                                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                                            <Typography variant="subtitle1">Example Messages</Typography>
                                            <IconButton 
                                                color="primary" 
                                                size="small"
                                                onClick={() => addExampleMessage(senderKey)}
                                            >
                                                <AddIcon />
                                            </IconButton>
                                        </Box>
                                        {profile.example_messages.map((message, index) => (
                                            <Box key={index} display="flex" gap={1} mb={1}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    value={message}
                                                    onChange={(e) => updateExampleMessage(senderKey, index, e.target.value)}
                                                    placeholder="Enter example message"
                                                />
                                                <IconButton 
                                                    color="error" 
                                                    size="small"
                                                    onClick={() => removeExampleMessage(senderKey, index)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </AccordionDetails>
                        </Accordion>

                        {/* Chat Settings Section */}
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                                <Typography variant="h6">Chat Settings</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box display="flex" flexDirection="column" gap={2}>
                                    <FormControl fullWidth>
                                        <InputLabel>Model Name</InputLabel>
                                        <Select
                                            value={config.chatSettings[senderKey].model_name}
                                            label="Model Name"
                                            onChange={(e) => updateChatSettings(senderKey, 'model_name', e.target.value)}
                                        >
                                            <MenuItem value="role_play">Role Play</MenuItem>
                                            <MenuItem value="realistic_chat">Realistic Chat</MenuItem>
                                            <MenuItem value="instruct">Instruct</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={config.chatSettings[senderKey].allow_nsfw}
                                                onChange={(e) => updateChatSettings(senderKey, 'allow_nsfw', e.target.checked)}
                                            />
                                        }
                                        label="Allow NSFW Content"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={config.chatSettings[senderKey].enable_memory}
                                                onChange={(e) => updateChatSettings(senderKey, 'enable_memory', e.target.checked)}
                                            />
                                        }
                                        label="Enable Memory"
                                    />
                                    
                                    <Box>
                                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                                            <Typography variant="subtitle1">Tasks</Typography>
                                            <IconButton 
                                                color="primary" 
                                                size="small"
                                                onClick={() => addTask(senderKey)}
                                            >
                                                <AddIcon />
                                            </IconButton>
                                        </Box>
                                        {config.chatSettings[senderKey].tasks.map((task, index) => (
                                            <Box key={index} display="flex" gap={1} mb={1}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    value={task}
                                                    onChange={(e) => updateTask(senderKey, index, e.target.value)}
                                                    placeholder="Enter task description"
                                                />
                                                <IconButton 
                                                    color="error" 
                                                    size="small"
                                                    onClick={() => removeTask(senderKey, index)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </AccordionDetails>
                        </Accordion>

                        {/* Image Settings Section */}
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                                <Typography variant="h6">Image Settings</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box display="flex" flexDirection="column" gap={2}>
                                    <TextField
                                        fullWidth
                                        label="Identity Image URL"
                                        value={config.imageSettings[senderKey].identity_image_url}
                                        onChange={(e) => updateImageSettings(senderKey, 'identity_image_url', e.target.value)}
                                    />
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleImageUpload(senderKey, updateImageSettings)}
                                        >
                                            Upload Image
                                        </Button>
                                        {config.imageSettings[senderKey].identity_image_url && (
                                            <img
                                                src={config.imageSettings[senderKey].identity_image_url}
                                                alt="Identity Image"
                                                style={{ maxWidth: "100px", maxHeight: "100px" }}
                                            />
                                        )}
                                    </Box>
                                    <FormControl fullWidth>
                                        <InputLabel>Model Name</InputLabel>
                                        <Select
                                            value={config.imageSettings[senderKey].model_name}
                                            label="Model Name"
                                            onChange={(e) => updateImageSettings(senderKey, 'model_name', e.target.value)}
                                        >
                                            <MenuItem value="base">Base</MenuItem>
                                            <MenuItem value="large">Large</MenuItem>
                                            <MenuItem value="persona">Persona</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <FormControl fullWidth>
                                        <InputLabel>Style</InputLabel>
                                        <Select
                                            value={config.imageSettings[senderKey].style}
                                            label="Style"
                                            onChange={(e) => updateImageSettings(senderKey, 'style', e.target.value)}
                                        >
                                            <MenuItem value="realistic">Realistic</MenuItem>
                                            <MenuItem value="anime">Anime</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <FormControl fullWidth>
                                        <InputLabel>Gender</InputLabel>
                                        <Select
                                            value={config.imageSettings[senderKey].gender}
                                            label="Gender"
                                            onChange={(e) => updateImageSettings(senderKey, 'gender', e.target.value)}
                                        >
                                            <MenuItem value="man">Man</MenuItem>
                                            <MenuItem value="woman">Woman</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <FormControl fullWidth>
                                        <InputLabel>Skin Color</InputLabel>
                                        <Select
                                            value={config.imageSettings[senderKey].skin_color}
                                            label="Skin Color"
                                            onChange={(e) => updateImageSettings(senderKey, 'skin_color', e.target.value)}
                                        >
                                            <MenuItem value="pale">Pale</MenuItem>
                                            <MenuItem value="white">White</MenuItem>
                                            <MenuItem value="tanned">Tanned</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <FormControl fullWidth>
                                        <InputLabel>Usage Mode</InputLabel>
                                        <Select
                                            value={config.imageSettings[senderKey].usage_mode}
                                            label="Usage Mode"
                                            onChange={(e) => updateImageSettings(senderKey, 'usage_mode', e.target.value)}
                                        >
                                            <MenuItem value="off">Off</MenuItem>
                                            <MenuItem value="force">Force</MenuItem>
                                            <MenuItem value="on_user_request">On User Request</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={config.imageSettings[senderKey].allow_nsfw}
                                                onChange={(e) => updateImageSettings(senderKey, 'allow_nsfw', e.target.checked)}
                                            />
                                        }
                                        label="Allow NSFW Images"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={config.imageSettings[senderKey].return_bs64}
                                                onChange={(e) => updateImageSettings(senderKey, 'return_bs64', e.target.checked)}
                                            />
                                        }
                                        label="Return Base64 Images"
                                    />
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    </CardContent>
                </Card>
            ))}

            {/* Floating Action Button for Save on Mobile */}
            {isMobile && (
                <Fab
                    color="primary"
                    aria-label="save"
                    sx={{ position: 'fixed', bottom: 16, right: 16 }}
                    onClick={handleSaveConfig}
                >
                    <SaveIcon />
                </Fab>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
            </Container>
        </Box>
    );
}
