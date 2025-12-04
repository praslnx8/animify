'use client';

import {
    Send as SendIcon,
    Home as HomeIcon,
    Settings as SettingsIcon,
    SmartToy as BotIcon,
    Person as PersonIcon,
    PlayArrow as PlayIcon,
    Stop as StopIcon,
    ContentCopy as CopyIcon,
    PlayCircle as PreviewIcon,
    AutoAwesome as AutoIcon,
    Close as CloseIcon,
    Animation as AnimateIcon,
} from '@mui/icons-material';
import {
    alpha,
    Avatar,
    Box,
    Button,
    Card,
    CardMedia,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    LinearProgress,
    Paper,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';
import React from 'react';
import { useRouter } from 'next/navigation';
import ChatAnimateDialog from '../components/ChatAnimateDialog';
import { Message } from '../models/Message';
import { Sender } from '../models/Sender';
import { sendChat } from '../api/sendChat';

export default function ChatPage() {
    const theme = useTheme();
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

    // Auto-conversation state
    const [autoTurns, setAutoTurns] = React.useState<number>(5);
    const [remainingTurns, setRemainingTurns] = React.useState<number>(0);
    const [isAutoRunning, setIsAutoRunning] = React.useState(false);
    const [turnsDialogOpen, setTurnsDialogOpen] = React.useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    React.useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (isAutoContinue: boolean = false) => {
        const userMessage: Message | null = input.trim()
            ? { id: Date.now().toString(), sender: sender, text: input, timestamp: new Date() }
            : null;
        const updatedMessages = userMessage ? [...messages, userMessage] : messages;

        if (userMessage) {
            setMessages(updatedMessages);
            setInput('');
        }

        try {
            setSendingMessage(true);
            const response = await sendChat({
                messages: updatedMessages,
                sender: sender,
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
                setMessages((prev) => [...prev, botMessage]);

                if (isAutoContinue && remainingTurns > 1) {
                    setRemainingTurns((prev) => prev - 1);
                } else if (isAutoContinue) {
                    setIsAutoRunning(false);
                    setRemainingTurns(0);
                }
            }
        } catch (error) {
            console.error('Error occurred while sending message:', error);
            setVideoError('An error occurred while processing your request.');
            if (isAutoContinue) {
                setIsAutoRunning(false);
                setRemainingTurns(0);
            }
        } finally {
            setSendingMessage(false);
        }
    };

    React.useEffect(() => {
        if (isAutoRunning && remainingTurns > 0 && !sendingMessage) {
            const timer = setTimeout(() => {
                handleSendMessage(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isAutoRunning, remainingTurns, sendingMessage]);

    const handleStartAutoConversation = () => {
        if (autoTurns > 0) {
            setRemainingTurns(autoTurns);
            setIsAutoRunning(true);
            setTurnsDialogOpen(false);
        }
    };

    const handleStopAutoConversation = () => {
        setIsAutoRunning(false);
        setRemainingTurns(0);
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

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && !sendingMessage && !isAutoRunning) {
            e.preventDefault();
            handleSendMessage(false);
        }
    };

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                height: '100dvh',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.default',
            }}
        >
            {/* Header */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 0,
                    borderBottom: 1,
                    borderColor: 'divider',
                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(20px)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                }}
            >
                <Container maxWidth="md">
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ py: 1.5 }}
                    >
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Avatar
                                sx={{
                                    bgcolor: 'primary.main',
                                    width: 40,
                                    height: 40,
                                }}
                            >
                                <BotIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle1" fontWeight={600}>
                                    AI Chat
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {messages.length} messages
                                </Typography>
                            </Box>
                        </Stack>
                        <Stack direction="row" spacing={0.5}>
                            <Tooltip title="Home">
                                <IconButton onClick={() => router.push('/')} size="small">
                                    <HomeIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Settings">
                                <IconButton onClick={() => router.push('/config')} size="small">
                                    <SettingsIcon />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Stack>
                </Container>
                {sendingMessage && <LinearProgress sx={{ height: 2 }} />}
            </Paper>

            {/* Auto-running indicator */}
            {isAutoRunning && (
                <Paper
                    elevation={0}
                    sx={{
                        py: 1,
                        px: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        borderBottom: 1,
                        borderColor: 'divider',
                    }}
                >
                    <Container maxWidth="md">
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <AutoIcon color="primary" fontSize="small" />
                                <Typography variant="body2" color="primary">
                                    Auto conversation running • {remainingTurns} turns remaining
                                </Typography>
                            </Stack>
                            <Button
                                size="small"
                                color="error"
                                startIcon={<StopIcon />}
                                onClick={handleStopAutoConversation}
                            >
                                Stop
                            </Button>
                        </Stack>
                    </Container>
                </Paper>
            )}

            {/* Messages Area */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    pb: '140px',
                }}
            >
                <Container maxWidth="md" sx={{ py: 2 }}>
                    {messages.length === 0 ? (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '50vh',
                                textAlign: 'center',
                                gap: 2,
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 80,
                                    height: 80,
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: 'primary.main',
                                }}
                            >
                                <BotIcon sx={{ fontSize: 40 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="h6" gutterBottom>
                                    Start a Conversation
                                </Typography>
                                <Typography variant="body2" color="text.secondary" maxWidth={300}>
                                    Type a message below or use the auto conversation feature to begin.
                                </Typography>
                            </Box>
                            <Button
                                variant="outlined"
                                startIcon={<AutoIcon />}
                                onClick={() => setTurnsDialogOpen(true)}
                                sx={{ mt: 1 }}
                            >
                                Start Auto Conversation
                            </Button>
                        </Box>
                    ) : (
                        <Stack spacing={2}>
                            {messages.map((message, index) => {
                                const isUser = message.sender === Sender.User;
                                return (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: 'flex',
                                            justifyContent: isUser ? 'flex-end' : 'flex-start',
                                        }}
                                    >
                                        <Stack
                                            direction={isUser ? 'row-reverse' : 'row'}
                                            spacing={1.5}
                                            alignItems="flex-start"
                                            sx={{ maxWidth: '85%' }}
                                        >
                                            <Avatar
                                                sx={{
                                                    width: 36,
                                                    height: 36,
                                                    bgcolor: isUser
                                                        ? 'primary.main'
                                                        : alpha(theme.palette.secondary.main, 0.2),
                                                    color: isUser ? 'primary.contrastText' : 'secondary.main',
                                                }}
                                            >
                                                {isUser ? <PersonIcon fontSize="small" /> : <BotIcon fontSize="small" />}
                                            </Avatar>
                                            <Box>
                                                <Card
                                                    elevation={0}
                                                    sx={{
                                                        p: 2,
                                                        bgcolor: isUser
                                                            ? 'primary.main'
                                                            : alpha(theme.palette.grey[500], 0.1),
                                                        color: isUser ? 'primary.contrastText' : 'text.primary',
                                                        borderRadius: 3,
                                                        borderTopLeftRadius: isUser ? 12 : 4,
                                                        borderTopRightRadius: isUser ? 4 : 12,
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body1"
                                                        sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}
                                                    >
                                                        {message.text}
                                                    </Typography>

                                                    {message.image && (
                                                        <Box sx={{ mt: 2 }}>
                                                            <CardMedia
                                                                component="img"
                                                                image={`data:image/jpeg;base64,${message.image}`}
                                                                alt="Generated image"
                                                                sx={{
                                                                    borderRadius: 2,
                                                                    maxHeight: 300,
                                                                    objectFit: 'contain',
                                                                }}
                                                            />
                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                startIcon={<AnimateIcon />}
                                                                onClick={() => handleOpenAnimateDialog(message)}
                                                                sx={{
                                                                    mt: 1.5,
                                                                    bgcolor: isUser
                                                                        ? 'rgba(255,255,255,0.2)'
                                                                        : 'primary.main',
                                                                    '&:hover': {
                                                                        bgcolor: isUser
                                                                            ? 'rgba(255,255,255,0.3)'
                                                                            : 'primary.dark',
                                                                    },
                                                                }}
                                                            >
                                                                Animate
                                                            </Button>
                                                        </Box>
                                                    )}

                                                    {message.videoUrl && (
                                                        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                                                            {videoError && videoError !== 'loading' && (
                                                                <Typography variant="caption" color="error">
                                                                    {videoError}
                                                                </Typography>
                                                            )}
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                startIcon={<CopyIcon />}
                                                                onClick={() =>
                                                                    navigator.clipboard.writeText(message.videoUrl || '')
                                                                }
                                                                sx={{
                                                                    borderColor: isUser
                                                                        ? 'rgba(255,255,255,0.5)'
                                                                        : undefined,
                                                                    color: isUser ? 'inherit' : undefined,
                                                                }}
                                                            >
                                                                Copy URL
                                                            </Button>
                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                startIcon={<PreviewIcon />}
                                                                onClick={() => handleVideoPreview(message.videoUrl || '')}
                                                                sx={{
                                                                    bgcolor: isUser
                                                                        ? 'rgba(255,255,255,0.2)'
                                                                        : 'secondary.main',
                                                                }}
                                                            >
                                                                Preview
                                                            </Button>
                                                        </Stack>
                                                    )}
                                                </Card>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{
                                                        display: 'block',
                                                        mt: 0.5,
                                                        px: 1,
                                                        textAlign: isUser ? 'right' : 'left',
                                                    }}
                                                >
                                                    {formatTime(message.timestamp)}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Box>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </Stack>
                    )}
                </Container>
            </Box>

            {/* Input Area */}
            <Paper
                elevation={8}
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    borderRadius: 0,
                    borderTop: 1,
                    borderColor: 'divider',
                    bgcolor: alpha(theme.palette.background.paper, 0.95),
                    backdropFilter: 'blur(20px)',
                    pb: 'max(16px, env(safe-area-inset-bottom))',
                    pt: 2,
                    px: 2,
                }}
            >
                <Container maxWidth="md">
                    <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <ToggleButtonGroup
                                value={sender}
                                exclusive
                                onChange={(_e, val) => {
                                    if (val) setSender(val);
                                }}
                                size="small"
                                disabled={sendingMessage || isAutoRunning}
                            >
                                <ToggleButton value={Sender.User} sx={{ px: 2 }}>
                                    <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
                                    User
                                </ToggleButton>
                                <ToggleButton value={Sender.Bot} sx={{ px: 2 }}>
                                    <BotIcon fontSize="small" sx={{ mr: 0.5 }} />
                                    Bot
                                </ToggleButton>
                            </ToggleButtonGroup>

                            <Tooltip title="Auto Conversation">
                                <span>
                                    <IconButton
                                        color={isAutoRunning ? 'error' : 'primary'}
                                        onClick={
                                            isAutoRunning
                                                ? handleStopAutoConversation
                                                : () => setTurnsDialogOpen(true)
                                        }
                                        disabled={sendingMessage && !isAutoRunning}
                                    >
                                        {isAutoRunning ? <StopIcon /> : <AutoIcon />}
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Stack>

                        <TextField
                            fullWidth
                            multiline
                            minRows={1}
                            maxRows={4}
                            placeholder={
                                sendingMessage
                                    ? 'Generating response...'
                                    : isAutoRunning
                                    ? 'Auto conversation in progress...'
                                    : 'Type your message...'
                            }
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isAutoRunning}
                            InputProps={{
                                sx: { borderRadius: 3, pr: 1 },
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleSendMessage(false)}
                                            disabled={sendingMessage || isAutoRunning || !input.trim()}
                                            sx={{
                                                bgcolor: 'primary.main',
                                                color: 'primary.contrastText',
                                                '&:hover': { bgcolor: 'primary.dark' },
                                                '&.Mui-disabled': {
                                                    bgcolor: alpha(theme.palette.primary.main, 0.3),
                                                    color: alpha(theme.palette.primary.contrastText, 0.5),
                                                },
                                            }}
                                        >
                                            {sendingMessage ? (
                                                <CircularProgress size={20} color="inherit" />
                                            ) : (
                                                <SendIcon />
                                            )}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Stack>
                </Container>
            </Paper>

            {/* Dialogs */}
            <ChatAnimateDialog
                open={animateDialogOpen}
                onClose={handleCloseAnimateDialog}
                message={selectedMessage}
                onLoading={() => setVideoError('loading')}
                onComplete={handleCompleteAnimation}
            />

            {/* Auto-Conversation Dialog */}
            <Dialog
                open={turnsDialogOpen}
                onClose={() => setTurnsDialogOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <AutoIcon color="primary" />
                        <Typography variant="h6">Auto Conversation</Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Run the conversation automatically for a specified number of turns. The AI will
                        alternate between user and bot responses.
                    </Typography>
                    <TextField
                        label="Number of Turns"
                        type="number"
                        fullWidth
                        value={autoTurns}
                        onChange={(e) => setAutoTurns(Math.max(1, parseInt(e.target.value) || 0))}
                        inputProps={{ min: 1, max: 100 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PlayIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setTurnsDialogOpen(false)} color="inherit">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleStartAutoConversation}
                        variant="contained"
                        disabled={autoTurns < 1}
                        startIcon={<PlayIcon />}
                    >
                        Start ({autoTurns} turns)
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Video Preview Dialog */}
            <Dialog
                open={videoPreviewOpen}
                onClose={handleCloseVideoPreview}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Video Preview</Typography>
                    <IconButton onClick={handleCloseVideoPreview} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0, bgcolor: 'black' }}>
                    {previewVideoUrl && (
                        <video
                            controls
                            autoPlay
                            style={{
                                width: '100%',
                                height: 'auto',
                                maxHeight: '70vh',
                                display: 'block',
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
