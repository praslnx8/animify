'use client';

import { Send as SendIcon } from '@mui/icons-material';
import {
    AppBar,
    Avatar,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Fab,
    IconButton,
    Paper,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Toolbar,
    Typography
} from '@mui/material';
import {
    Home as HomeIcon,
    Settings as SettingsIcon,
    Chat as ChatIcon
} from '@mui/icons-material';
import React from 'react';
import { useRouter } from 'next/navigation';
import ChatAnimateDialog from '../components/ChatAnimateDialog';
import { Message } from '../models/Message';
import { Sender } from '../models/Sender';
import { sendChat } from '../api/sendChat';


export default function ChatPage() {
    const router = useRouter();
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [input, setInput] = React.useState('');
    const [sender, setSender] = React.useState<Sender>(Sender.User);
    const [sendingMessage, setSendingMessage] = React.useState(false);
    const [animateDialogOpen, setAnimateDialogOpen] = React.useState(false);
    const [selectedMessage, setSelectedMessage] = React.useState<Message | null>(null);
    const [videoError, setVideoError] = React.useState<string | null>(null);
    const [videoPreviewOpen, setVideoPreviewOpen] = React.useState(false);
    const [previewVideoUrl, setPreviewVideoUrl] = React.useState<string | null>(null);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    React.useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        const userMessage: Message | null = input.trim() ? { id: Date.now().toString(), sender: sender, text: input, timestamp: new Date() } : null;
        const updatedMessages = userMessage ? [...messages, userMessage] : messages;

        if (userMessage) {
            setMessages(updatedMessages);
            setInput('');
        }

        try {
            setSendingMessage(true);
            const response = await sendChat({
                messages: updatedMessages,
                sender: sender
            });
            if (response) {
                const botMessage: Message = {
                    id: Date.now().toString(),
                    sender: response.sender,
                    text: response.message,
                    image: response.bs64 || undefined,
                    prompt: response.prompt || undefined,
                    timestamp: new Date(),
                };
                setSender(response.sender);
                setMessages(prev => [...prev, botMessage]);
            }
        } catch (error) {
            console.error('Error occurred while sending message:', error);
            setVideoError('An error occurred while processing your request.');
        } finally {
            setSendingMessage(false);
        }
    };

    const handleOpenAnimateDialog = (message: Message) => {
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

    const handleVideoPreview = (videoUrl: string) => {
        setPreviewVideoUrl(videoUrl);
        setVideoPreviewOpen(true);
    };

    const handleCloseVideoPreview = () => {
        setVideoPreviewOpen(false);
        setPreviewVideoUrl(null);
    };

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            height: '100dvh', // Use dynamic viewport height for better mobile support
            display: 'flex', 
            flexDirection: 'column', 
            background: 'background.default',
            position: 'relative'
        }}>
            <AppBar position="sticky" color="default">
                <Toolbar>
                    <Avatar sx={{ mr: 1 }}><ChatIcon color="primary" /></Avatar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>Chat</Typography>
                    <IconButton onClick={() => router.push('/')} color="primary">
                        <HomeIcon />
                    </IconButton>
                    <IconButton onClick={() => router.push('/config')} color="primary">
                        <SettingsIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            
            <Typography variant="h6" gutterBottom sx={{ mb: 1, textAlign: 'center' }}>Conversation</Typography>
            <Divider sx={{ mb: 1 }} />

            <Box sx={{ 
                flex: 1, 
                overflowY: 'auto', 
                p: 2, 
                borderRadius: 2,
                mb: 1, // Add margin bottom to prevent overlap with input
                paddingBottom: '120px' // Extra padding to ensure content is visible above input
            }}>
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
                                        sx={{ mt: 1, mr: 1 }}
                                    >
                                        Copy Video URL
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={() => handleVideoPreview(message.videoUrl || '')}
                                        sx={{ mt: 1 }}
                                    >
                                        Preview Video
                                    </Button>
                                </Box>
                            )}
                        </Paper>
                    </Box>
                ))}
                <div ref={messagesEndRef} />
            </Box>

            <Paper elevation={2} sx={{ 
                p: 1, 
                borderRadius: 3, 
                bgcolor: 'background.paper', 
                mx: 0.5,
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
                // Add safe area padding for mobile devices
                paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
                paddingLeft: 'max(4px, env(safe-area-inset-left))',
                paddingRight: 'max(4px, env(safe-area-inset-right))'
            }}>
                <Box display="flex" alignItems="center" gap={0.5}>
                    <TextField
                        label="Message"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        size="small"
                        multiline
                        minRows={1}
                        maxRows={4}
                        sx={{ 
                            flex: 1,
                            bgcolor: 'background.default', 
                            borderRadius: 2 
                        }}
                    />
                    <ToggleButtonGroup
                        value={sender}
                        exclusive
                        onChange={(_e, val) => { if (val) setSender(val); }}
                        size="small"
                        sx={{ ml: 0.5 }}
                    >
                        <ToggleButton value={Sender.User}>User</ToggleButton>
                        <ToggleButton value={Sender.Bot}>Bot</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            </Paper>

            {/* Floating Action Button for Send */}
            <Fab
                color="primary"
                onClick={handleSendMessage}
                disabled={sendingMessage}
                sx={{
                    position: 'fixed',
                    bottom: 100, // Position above the input area
                    right: 24,
                    zIndex: 1001,
                    width: 56,
                    height: 56
                }}
            >
                {sendingMessage ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
            </Fab>

            <ChatAnimateDialog
                open={animateDialogOpen}
                onClose={handleCloseAnimateDialog}
                message={selectedMessage}
                onLoading={() => setVideoError('loading')}
                onComplete={handleCompleteAnimation}
            />

            {/* Video Preview Dialog */}
            <Dialog
                open={videoPreviewOpen}
                onClose={handleCloseVideoPreview}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { bgcolor: 'background.paper', borderRadius: 2 }
                }}
            >
                <DialogTitle>Video Preview</DialogTitle>
                <DialogContent>
                    {previewVideoUrl && (
                        <video
                            controls
                            autoPlay
                            style={{
                                width: '100%',
                                height: 'auto',
                                borderRadius: 8,
                                backgroundColor: '#000'
                            }}
                        >
                            <source src={previewVideoUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
}
