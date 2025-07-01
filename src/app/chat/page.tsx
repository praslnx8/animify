'use client';

import React from 'react';
import {
    Box,
    Button,
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
import ChatAnimateDialog from '../components/ChatAnimateDialog';
import { Message } from '../models/Message';
import { Sender } from '../models/Sender';


export default function ChatPage() {
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [input, setInput] = React.useState('');
    const [sender, setSender] = React.useState<Sender>(Sender.User);
    const [sendingMessage, setSendingMessage] = React.useState(false);
    const [animateDialogOpen, setAnimateDialogOpen] = React.useState(false);
    const [selectedMessage, setSelectedMessage] = React.useState<any | null>(null);
    const [videoError, setVideoError] = React.useState<string | null>(null);

    const config = JSON.parse(process.env.CONFIG_JSON || '{}');

    const handleSendMessage = async () => {
        const userMessage: Message | null = input.trim() ? { id: Date.now().toString(), sender: sender, text: input, timestamp: new Date() } : null;
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
                    context: updatedMessages.slice(-15).map(msg => ({
                        message: msg.text,
                        turn: msg.sender === Sender.User ? 'user' : 'bot',
                        image_prompt: msg.prompt || undefined
                    })),
                    bot_profile: chatConfig.botProfiles[Sender.Bot],
                    user_profile: chatConfig.botProfiles[Sender.User],
                    chat_settings: chatConfig.chatSettings,
                    image_settings: chatConfig.imageSettings[Sender.Bot],
                    output_audio: false,
                    enable_proactive_photos: true,
                }),
            });

            const data = await response.json();
            if (response.ok && data.response) {
                const botMessage: Message = {
                    id: Date.now().toString(),
                    sender: Sender.Bot,
                    text: data.response,
                    image: data.image_response?.bs64 || undefined,
                    prompt: data.image_response?.prompt || undefined,
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, botMessage]);
            } else {
                console.error('Error fetching chatbot response:', data);
            }
        } catch (error) {
            console.error('Error occurred while sending message:', error);
        } finally {
            setSendingMessage(false);
        }
    };

    const handleOpenAnimateDialog = (message: any) => {
        setSelectedMessage(message);
        setAnimateDialogOpen(true);
    };

    const handleCloseAnimateDialog = () => {
        setAnimateDialogOpen(false);
        setSelectedMessage(null);
    };
    
    const handleCompleteAnimation = (videoUrl?: string) => {
        if (selectedMessage && videoUrl) {
            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg.id === selectedMessage.id ? { ...msg, videoUrl } : msg
                )
            );
            setSelectedMessage(null);
            setAnimateDialogOpen(false);
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
                            flexDirection: message.sender === Sender.User ? 'row-reverse' : 'row',
                            alignItems: 'flex-start', // Adjust alignment for better readability
                            mb: 1.5, // Increase margin for spacing
                            pl: message.sender === Sender.User ? 3 : 0,
                            pr: message.sender === Sender.Bot ? 0 : 3,
                        }}
                    >
                        <Paper
                            elevation={2} // Increase elevation for better visibility
                            sx={{
                                p: 1.5, // Increase padding for readability
                                bgcolor: message.sender === Sender.User ? 'primary.light' : 'grey.700', // Different background for bot
                                color: message.sender === Sender.User ? 'primary.contrastText' : 'text.secondary', // Different text color for bot
                                borderRadius: 4, // Increase border radius for smoother edges
                                maxWidth: '85vw', // Adjust max width for better layout
                                minWidth: 50, // Increase minimum width
                                ml: message.sender === Sender.User ? 0 : 1,
                                mr: message.sender === Sender.Bot ? 1 : 0,
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
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        sx={{ mt: 1 }}
                                        onClick={() => handleOpenAnimateDialog(message)}
                                    >
                                        Animate Image
                                    </Button>
                                </Box>
                            )}
                            {message.videoUrl && (
                                <Box sx={{ mt: 1, textAlign: 'center', position: 'relative' }}>
                                    {videoError && (
                                        <Typography color="error" textAlign="center" p={1} sx={{ position: 'absolute', bottom: 0, width: '100%' }}>
                                            {videoError}
                                        </Typography>
                                    )}
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => navigator.clipboard.writeText(message.videoUrl || '')}
                                        sx={{ mt: 1 }}
                                    >
                                        Copy Video URL
                                    </Button>
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
                <Box display="flex" alignItems="center" gap={1} mt={1} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Active Role:</Typography>
                    <ToggleButtonGroup
                        value={sender}
                        exclusive
                        onChange={(_e, val) => { if (val) setSender(val); }}
                        size="small"
                        sx={{ minWidth: 80 }}
                    >
                        <ToggleButton value={Sender.User}>User</ToggleButton>
                        <ToggleButton value={Sender.Bot}>Bot</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            </Paper>

            <ChatAnimateDialog
                open={animateDialogOpen}
                onClose={handleCloseAnimateDialog}
                message={selectedMessage}
                onLoading={() => setVideoError('loading')}
                onComplete={handleCompleteAnimation}
            />
        </Box>
    );
}
