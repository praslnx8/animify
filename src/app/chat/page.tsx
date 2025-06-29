'use client';

import {
    Send as SendIcon
} from '@mui/icons-material';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    CircularProgress,
    Divider,
    IconButton,
    Paper,
    TextField,
    ToggleButton, ToggleButtonGroup,
    Typography
} from '@mui/material';
import React from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

type BotRole = 'Bot1' | 'Bot2';

type BotProfile = {
    id: string;
    name: string;
    description: string;
    appearance: string;
    pronoun: string;
    example_messages: string[];
};

const botProfileFields: Array<keyof BotProfile> = ['id', 'name', 'description', 'appearance', 'pronoun', 'example_messages'];

type UserProfile = {
    id: string;
    name: string;
    description: string;
    appearance: string;
    pronoun: string;
    example_messages: string[];
};

const userProfileFields: Array<keyof UserProfile> = ['id', 'name', 'description', 'appearance', 'pronoun', 'example_messages'];

export default function ChatPage() {
    const [messages, setMessages] = React.useState<{ sender: string; text: string; image?: string; media_url?: string; media_id?: string | null }[]>([]);
    const [input, setInput] = React.useState('');
    const [activeBot, setActiveBot] = React.useState<BotRole>('Bot1');
    const [sendingMessage, setSendingMessage] = React.useState(false);
    const [botProfiles, setBotProfiles] = React.useState<Record<'Bot1' | 'Bot2', BotProfile>>({
        Bot1: {
            id: '',
            name: '',
            description: '',
            appearance: '',
            pronoun: '',
            example_messages: ['']
        },
        Bot2: {
            id: '',
            name: '',
            description: '',
            appearance: '',
            pronoun: '',
            example_messages: ['']
        }
    });
    const [userProfile, setUserProfile] = React.useState<UserProfile>({
        id: '',
        name: '',
        description: '',
        appearance: '',
        pronoun: '',
        example_messages: ['']
    });
    const [chatSettings, setChatSettings] = React.useState({
        model_name: 'base',
        allow_nsfw: false,
        tasks: [''],
        enable_memory: false
    });
    const [imageSettings, setImageSettings] = React.useState({
        identity_image_url: '',
        model_name: 'base',
        style: 'realistic',
        gender: 'neutral',
        skin_color: 'default',
        allow_nsfw: false,
        usage_mode: 'off',
        return_bs64: false
    });

    const handleSendMessage = async () => {
        const userMessage = input.trim() ? { sender: activeBot, text: input, media_id: null } : null;
        const updatedMessages = userMessage ? [...messages, userMessage] : messages;

        if (userMessage) {
            setMessages(updatedMessages);
            setInput('');
        }

        try {
            setSendingMessage(true);
            const response = await fetch('/api/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    context: updatedMessages.map(msg => ({
                        message: msg.text,
                        turn: msg.sender === activeBot ? 'user' : 'bot',
                        media_id: msg.media_id || null,
                    })),
                    bot_profile: botProfiles[activeBot],
                    user_profile: userProfile,
                    chat_settings: chatSettings,
                    image_settings: imageSettings,
                    output_audio: false,
                    enable_proactive_photos: true,
                }),
            });

            const data = await response.json();
            if (response.ok && data.response) {
                const botMessage = {
                    sender: activeBot === 'Bot1' ? 'Bot2' : 'Bot1',
                    text: data.response,
                    image: data.image_response?.bs64 || undefined,
                    image_prompt: data.image_response?.prompt || undefined,
                };
                setMessages(prev => [...prev, botMessage]);
                setActiveBot(prev => (prev === 'Bot1' ? 'Bot2' : 'Bot1'));
            } else {
                console.error('Error fetching chatbot response:', data);
            }
        } catch (error) {
            console.error('Error occurred while sending message:', error);
        } finally {
            setSendingMessage(false);
        }
    };

    const handleProfileChange = (bot: BotRole, field: keyof BotProfile, value: string) => {
        setBotProfiles(prev => ({
            ...prev,
            [bot]: {
                ...prev[bot],
                [field]: value
            }
        }));
    };

    const handleUserProfileChange = (field: keyof UserProfile, value: string) => {
        setUserProfile(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleChatSettingsChange = (field: keyof typeof chatSettings, value: any) => {
        setChatSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleImageSettingsChange = (field: keyof typeof imageSettings, value: any) => {
        setImageSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'background.default', pb: 0.5 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 1, textAlign: 'center' }}>Conversation</Typography>
            <Divider sx={{ mb: 1 }} />

            <Box sx={{ flex: 1, overflowY: 'auto', p: 2, borderRadius: 2 }}>
                {messages.length === 0 && (
                    <Typography color="text.secondary" align="center" sx={{ mt: 2 }}>
                        No messages yet. Start the conversation below!
                    </Typography>
                )}
                {messages.map((message, index) => (
                    <Box
                        key={index}
                        sx={{
                            display: 'flex',
                            flexDirection: message.sender === 'Bot1' ? 'row-reverse' : 'row',
                            alignItems: 'flex-end',
                            mb: 1.2,
                            pl: message.sender === 'Bot1' ? 2.5 : 0,
                            pr: message.sender === 'Bot1' ? 0 : 2.5,
                        }}
                    >
                        <Paper
                            elevation={1}
                            sx={{
                                p: 1,
                                bgcolor: message.sender === 'Bot1' ? 'primary.light' : 'grey.900',
                                color: message.sender === 'Bot1' ? 'primary.contrastText' : 'text.primary',
                                borderRadius: 3,
                                maxWidth: '90vw',
                                minWidth: 40,
                                ml: message.sender === 'Bot1' ? 0 : 0.5,
                                mr: message.sender === 'Bot1' ? 0.5 : 0,
                                position: 'relative',
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: '0.98rem',
                                    whiteSpace: 'pre-line',
                                }}
                            >
                                {message.text}
                            </Typography>
                            {message.image && (
                                <Box sx={{ mt: 1, textAlign: 'center' }}>
                                    <img
                                        src={`data:image/jpeg;base64,${message.image}`}
                                        alt="Response Image"
                                        style={{ width: '100%', maxWidth: '80vw', height: 'auto', borderRadius: 12 }}
                                    />
                                </Box>
                            )}
                            {message.media_url && (
                                <Box sx={{ mt: 1, textAlign: 'center' }}>
                                    <img
                                        src={message.media_url}
                                        alt="Media Response"
                                        style={{ width: '100%', maxWidth: '80vw', height: 'auto', borderRadius: 12 }}
                                    />
                                </Box>
                            )}
                        </Paper>
                    </Box>
                ))}
            </Box>

            <Paper elevation={2} sx={{ p: 1, borderRadius: 3, bgcolor: 'background.paper', mx: 0.5 }}>
                <Box display="flex" alignItems="center" gap={0.5}>
                    <TextField
                        label="Message"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        fullWidth
                        size="small"
                        multiline
                        minRows={1}
                        maxRows={4}
                        sx={{ flex: 1, bgcolor: 'background.default', borderRadius: 2 }}
                    />
                    <IconButton
                        aria-label="Send"
                        color="primary"
                        onClick={handleSendMessage}
                        disabled={sendingMessage}
                        sx={{ ml: 0.2, bgcolor: 'primary.light', '&:hover': { bgcolor: 'primary.main', color: 'white' }, p: 0.75 }}
                        size="medium"
                    >
                        {sendingMessage ? <CircularProgress size={20} color="inherit" /> : <SendIcon fontSize="medium" />}
                    </IconButton>
                </Box>
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Active Role:</Typography>
                    <ToggleButtonGroup
                        value={activeBot}
                        exclusive
                        onChange={(_e, val) => { if (val) setActiveBot(val); }}
                        size="small"
                        sx={{ minWidth: 80 }}
                    >
                        <ToggleButton value="Bot1">Bot1</ToggleButton>
                        <ToggleButton value="Bot2">Bot2</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
                <Box display="flex" flexDirection="column" gap={1} mt={2}>
                    {['Bot1', 'Bot2'].map(bot => (
                        <Accordion key={bot} sx={{ bgcolor: 'background.default' }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="subtitle1">{bot} Profile</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                {botProfileFields.map(field => (
                                    <TextField
                                        key={field}
                                        label={field}
                                        value={botProfiles[bot as BotRole][field]}
                                        onChange={(e) => handleProfileChange(bot as BotRole, field, e.target.value)}
                                        fullWidth
                                        size="small"
                                        sx={{ mb: 1 }}
                                    />
                                ))}
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>
                <Box display="flex" flexDirection="column" gap={1} mt={2}>
                    <Accordion sx={{ bgcolor: 'background.default' }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle1">User Profile</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {userProfileFields.map(field => (
                                <TextField
                                    key={field}
                                    label={field}
                                    value={userProfile[field]}
                                    onChange={(e) => handleUserProfileChange(field, e.target.value)}
                                    fullWidth
                                    size="small"
                                    sx={{ mb: 1 }}
                                />
                            ))}
                        </AccordionDetails>
                    </Accordion>

                    <Accordion sx={{ bgcolor: 'background.default' }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle1">Chat Settings</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {Object.keys(chatSettings).map(field => (
                                <TextField
                                    key={field}
                                    label={field}
                                    value={chatSettings[field as keyof typeof chatSettings]}
                                    onChange={(e) => handleChatSettingsChange(field as keyof typeof chatSettings, e.target.value)}
                                    fullWidth
                                    size="small"
                                    sx={{ mb: 1 }}
                                />
                            ))}
                        </AccordionDetails>
                    </Accordion>

                    <Accordion sx={{ bgcolor: 'background.default' }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle1">Image Settings</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {Object.keys(imageSettings).map(field => (
                                <TextField
                                    key={field}
                                    label={field}
                                    value={imageSettings[field as keyof typeof imageSettings]}
                                    onChange={(e) => handleImageSettingsChange(field as keyof typeof imageSettings, e.target.value)}
                                    fullWidth
                                    size="small"
                                    sx={{ mb: 1 }}
                                />
                            ))}
                        </AccordionDetails>
                    </Accordion>
                </Box>
            </Paper>
        </Box>
    );
}
