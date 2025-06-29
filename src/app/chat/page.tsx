'use client';

import React from 'react';
import {
    Box,
    CircularProgress,
    Divider,
    IconButton,
    Paper,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import chatConfig from '../config/chat_config.json';


export default function ChatPage() {
    const [messages, setMessages] = React.useState<any[]>([]);
    const [input, setInput] = React.useState('');
    const [activeBot, setActiveBot] = React.useState<'Bot1' | 'Bot2'>('Bot1');
    const [sendingMessage, setSendingMessage] = React.useState(false);

    const config = JSON.parse(process.env.CONFIG_JSON || '{}');

    const handleSendMessage = async () => {
        const userMessage = input.trim() ? { sender: activeBot, text: input, image_prompt: null } : null;
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
                        image_prompt: msg.image_prompt || undefined
                    })),
                    bot_profile: chatConfig.botProfiles[activeBot],
                    user_profile: chatConfig.botProfiles[activeBot === 'Bot1' ? 'Bot2' : 'Bot1'],
                    chat_settings: chatConfig.chatSettings,
                    image_settings: chatConfig.imageSettings,
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
            </Paper>
        </Box>
    );
}
