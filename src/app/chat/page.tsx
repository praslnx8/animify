'use client';

import {
    Send as SendIcon
} from '@mui/icons-material';
import {
    Box,
    Divider,
    IconButton,
    Paper,
    TextField,
    ToggleButton, ToggleButtonGroup,
    Typography
} from '@mui/material';
import React from 'react';

enum BotRole {
    Bot1 = 'Bot1',
    Bot2 = 'Bot2',
}

export default function ChatPage() {
    const [messages, setMessages] = React.useState<{ sender: string; text: string; image?: string; media_url?: string; media_id?: string | null }[]>([]);
    const [input, setInput] = React.useState('');
    const [activeBot, setActiveBot] = React.useState<BotRole>(BotRole.Bot1);
    const [bot1Id, setBot1Id] = React.useState('268785');
    const [bot2Id, setBot2Id] = React.useState('268786');

    const handleSendMessage = async () => {
        const userMessage = input.trim() ? { sender: activeBot, text: input, media_id: null } : null;
        const updatedMessages = userMessage ? [...messages, userMessage] : messages;

        if (userMessage) {
            setMessages(updatedMessages);
            setInput('');
        }

        try {
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
                    strapi_bot_id: activeBot === BotRole.Bot1 ? bot1Id : bot2Id,
                    output_audio: false,
                    enable_proactive_photos: true,
                }),
            });

            const data = await response.json();
            if (response.ok && data.responses?.[0]?.response) {
                const botMessage = {
                    sender: activeBot === BotRole.Bot1 ? BotRole.Bot2 : BotRole.Bot1,
                    text: data.responses[0].response,
                    image: data.responses[0]?.image_response?.bs64 || undefined,
                    media_url: data.responses[0]?.media_response?.media_url || undefined,
                    media_id: data.responses[0]?.media_response?.media_id || null,
                };
                setMessages(prev => [...prev, botMessage]);
                setActiveBot(prev => (prev === BotRole.Bot1 ? BotRole.Bot2 : BotRole.Bot1));
            } else {
                console.error('Error fetching chatbot response:', data);
            }
        } catch (error) {
            console.error('Error occurred while sending message:', error);
        }
    };

    const requestContextualPhoto = async (messageIndex: number) => {
        try {
            const context = messages.map(msg => ({
                message: msg.text,
                turn: msg.sender === activeBot ? 'user' : 'bot',
                media_id: msg.media_id || null,
            }));

            const response = await fetch('/api/contextualPhoto', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    strapi_bot_id: activeBot === BotRole.Bot1 ? bot1Id : bot2Id,
                    user_id: 'OkBq02NSt3eHY9Y65pmd1Yjxaut1',
                    context,
                    photo_model_id: 'basic',
                }),
            });

            const data = await response.json();
            if (response.ok && data.responses?.[0]?.media_response?.media_url) {
                const updatedMessages = [...messages];
                updatedMessages[messageIndex].media_url = data.media_url;
                updatedMessages[messageIndex].media_id = data.media_id;
                setMessages(updatedMessages);
            } else {
                console.error('Error fetching contextual photo:', data);
            }
        } catch (error) {
            console.error('Error occurred while requesting contextual photo:', error);
        }
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
                            <IconButton
                                size="small"
                                onClick={() => requestContextualPhoto(index)}
                                sx={{ position: 'absolute', top: 2, right: 2, color: 'grey.400' }}
                                title="Request Contextual Photo"
                            >
                                <SendIcon fontSize="small" />
                            </IconButton>
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
                        sx={{ ml: 0.2, bgcolor: 'primary.light', '&:hover': { bgcolor: 'primary.main', color: 'white' }, p: 0.75 }}
                        size="medium"
                    >
                        <SendIcon fontSize="medium" />
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
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                    <TextField
                        label="Bot1 ID"
                        value={bot1Id}
                        onChange={(e) => setBot1Id(e.target.value)}
                        size="small"
                        sx={{ flex: 1, bgcolor: 'background.default', borderRadius: 2 }}
                    />
                    <TextField
                        label="Bot2 ID"
                        value={bot2Id}
                        onChange={(e) => setBot2Id(e.target.value)}
                        size="small"
                        sx={{ flex: 1, bgcolor: 'background.default', borderRadius: 2 }}
                    />
                </Box>
            </Paper>
        </Box>
    );
}
