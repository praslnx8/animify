'use client';

import {
  Animation as AnimationIcon,
  AutoFixHigh as AutoFixHighIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  PlayArrow as PlayArrowIcon,
  AutoStories as AutoStoriesIcon,
  Refresh as RefreshIcon,
  ErrorOutline as ErrorIcon,
  MoreHoriz as MoreHorizIcon,
  Close as CloseIcon,
  FormatQuote as FormatQuoteIcon,
} from '@mui/icons-material';
import {
  Box, Card, CircularProgress, IconButton, Tooltip, Typography, Button, 
  Collapse, Chip, Fab, Alert, Divider, Fade, Zoom, Menu, MenuItem, ListItemIcon, ListItemText
} from '@mui/material';
import React, { useEffect, useRef, useState, useCallback } from 'react';

import { downloadMedia } from '../api/downloadMedia';
import { MediaItem } from '../models/MediaItem';
import { MediaType } from '../models/MediaType';
import PhotoAnimateDialog, { silentPhotoAnimate } from './PhotoAnimateDialog';
import PhotoTransformDialog, { silentPhotoTransform } from './PhotoTransformDialog';
import AnimateStoryDialog from './AnimateStoryDialog';

const enum VideoStatus { Idle = 'idle', Loading = 'loading', Playing = 'playing', Ended = 'ended', Error = 'error' }

interface MediaItemProps {
  mediaItem: MediaItem;
  addMediaItem: (item: MediaItem) => void;
  updateMediaItem: (item: MediaItem) => void;
  onDelete: (item: MediaItem) => void;
}

const MediaItemComponent: React.FC<MediaItemProps> = ({ mediaItem, addMediaItem, updateMediaItem, onDelete }) => {
  const [transformOpen, setTransformOpen] = useState(false);
  const [animateOpen, setAnimateOpen] = useState(false);
  const [animateStoryOpen, setAnimateStoryOpen] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<HTMLSpanElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [videoKey, setVideoKey] = useState(0);
  const [videoStatus, setVideoStatus] = useState<VideoStatus>(VideoStatus.Idle);
  const [videoError, setVideoError] = useState<string | null>(null);

  const isVideo = mediaItem.type === MediaType.Video;
  const hasError = mediaItem.error || videoError;
  const menuOpen = Boolean(menuAnchor);

  // Reset video state when mediaItem changes
  useEffect(() => {
    setVideoStatus(VideoStatus.Idle);
    setVideoError(null);
    setVideoKey(0);
  }, [mediaItem.id]);

  // Timer effect with proper cleanup
  useEffect(() => {
    if (!isVideo || !mediaItem.createdAt || !timerRef.current) return;

    const updateTimeElapsed = () => {
      const now = Date.now();
      const diff = now - mediaItem.createdAt!;
      const totalSeconds = Math.floor(diff / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      const formattedMinutes = String(minutes).padStart(2, '0');
      const formattedSeconds = String(seconds).padStart(2, '0');
      
      if (timerRef.current) {
        timerRef.current.textContent = `${formattedMinutes}:${formattedSeconds}`;
      }
    };

    updateTimeElapsed();
    timerIntervalRef.current = setInterval(updateTimeElapsed, 1000);
    
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [isVideo, mediaItem.createdAt]);

  const handlePlay = useCallback(() => {
    setVideoError(null);
    setVideoStatus(VideoStatus.Loading);
    setVideoKey(k => k + 1);
  }, []);

  const handleDownload = useCallback(() => {
    downloadMedia(mediaItem.url!, mediaItem.id, isVideo);
  }, [mediaItem.url, mediaItem.id, isVideo]);

  const handleRetry = useCallback(async () => {
    if (!mediaItem.parent || !mediaItem.prompt) return;
    
    setRetrying(true);
    setMenuAnchor(null);
    try {
      if (mediaItem.type === MediaType.Video) {
        setAnimateOpen(true);
      } else {
        const commonProps = { 
          parentMediaItem: mediaItem.parent, 
          prompt: mediaItem.prompt, 
          addMediaItem, 
          updateMediaItem 
        };
        await silentPhotoTransform({ 
          ...commonProps, 
          modelName: mediaItem.model_name, 
          style: mediaItem.style, 
          gender: mediaItem.gender, 
          bodyType: mediaItem.body_type, 
          skinColor: mediaItem.skin_color, 
          autoDetectHairColor: mediaItem.auto_detect_hair_color, 
          nsfwPolicy: mediaItem.nsfw_policy 
        });
      }
    } finally {
      setRetrying(false);
    }
  }, [mediaItem, addMediaItem, updateMediaItem]);

  const getVideoUrlWithCacheBuster = useCallback(() => 
    `${mediaItem.url}${mediaItem.url!.includes('?') ? '&' : '?'}t=${videoKey}`,
    [mediaItem.url, videoKey]
  );

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const renderMedia = () => {
    if (mediaItem.loading) {
      return (
        <Box sx={mediaContainer}>
          <Box sx={loadingPulseStyle}>
            <CircularProgress 
              size={56} 
              thickness={3} 
              sx={{ 
                color: '#58a6ff',
                filter: 'drop-shadow(0 0 8px rgba(88, 166, 255, 0.4))'
              }} 
            />
          </Box>
          <Typography variant="body2" sx={{ color: '#8b949e', mt: 2.5, fontWeight: 500 }}>
            Creating magic...
          </Typography>
          <Typography variant="caption" sx={{ color: '#484f58', mt: 0.5 }}>
            This may take a moment
          </Typography>
        </Box>
      );
    }

    if (isVideo) {
      const showThumbnail = videoStatus === VideoStatus.Idle || videoStatus === VideoStatus.Ended || videoStatus === VideoStatus.Error;
      
      return (
        <Box sx={{ 
          width: '100%', 
          height: '100%', 
          bgcolor: '#000', 
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Thumbnail layer */}
          {showThumbnail && mediaItem.parent?.url && (
            <Fade in timeout={300}>
              <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={mediaItem.parent.url} alt="Video thumbnail" style={imgStyle} />
                <Zoom in timeout={400}>
                  <Fab 
                    onClick={handlePlay} 
                    sx={fabPlayStyle}
                    size="large"
                  >
                    <PlayArrowIcon sx={{ fontSize: 36, ml: 0.5 }} />
                  </Fab>
                </Zoom>
              </Box>
            </Fade>
          )}

          {/* Loading layer */}
          {videoStatus === VideoStatus.Loading && (
            <Box sx={loadingOverlay}>
              <Box sx={loadingPulseStyle}>
                <CircularProgress size={56} thickness={3} sx={{ color: '#58a6ff' }} />
              </Box>
              <Typography variant="body2" sx={{ color: '#e6edf3', mt: 2.5, fontWeight: 500 }}>
                Loading video...
              </Typography>
            </Box>
          )}

          {/* Video layer */}
          {(videoStatus === VideoStatus.Loading || videoStatus === VideoStatus.Playing) && (
            <Box sx={{
              position: videoStatus === VideoStatus.Playing ? 'relative' : 'absolute',
              width: '100%',
              height: '100%',
              display: videoStatus === VideoStatus.Playing ? 'flex' : 'none',
              alignItems: 'center',
              justifyContent: 'center',
              top: 0,
              left: 0,
            }}>
              <video
                key={videoKey}
                ref={videoRef}
                controls
                playsInline
                autoPlay
                style={imgStyle}
                src={getVideoUrlWithCacheBuster()}
                onLoadedData={() => setVideoStatus(VideoStatus.Playing)}
                onError={() => {
                  setVideoStatus(VideoStatus.Error);
                  setVideoError('Failed to load video. Please try again.');
                }}
                onEnded={() => setVideoStatus(VideoStatus.Ended)}
              />
            </Box>
          )}
        </Box>
      );
    }

    return (
      <Box sx={{ ...mediaContainer, bgcolor: '#000' }}>
        <Fade in timeout={300}>
          <img src={mediaItem.url} alt="Media" style={imgStyle} />
        </Fade>
      </Box>
    );
  };

  return (
    <>
      <Card sx={cardStyle}>
        <Box sx={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
          {/* Status indicators - glass morphism style */}
          {isVideo && mediaItem.createdAt && (
            <Chip 
              label={
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Typography variant="caption" component="span">⏱</Typography>
                  <span ref={timerRef}>00:00</span>
                </Box>
              }
              size="small" 
              sx={timerChipStyle} 
            />
          )}
          
          {isVideo && videoStatus !== VideoStatus.Idle && videoStatus !== VideoStatus.Ended && (
            <Chip 
              label={videoStatus} 
              size="small" 
              sx={{
                ...statusChipStyle,
                bgcolor: videoStatus === VideoStatus.Error 
                  ? 'rgba(248, 81, 73, 0.2)' 
                  : videoStatus === VideoStatus.Playing 
                    ? 'rgba(63, 185, 80, 0.2)' 
                    : 'rgba(88, 166, 255, 0.2)',
                color: videoStatus === VideoStatus.Error 
                  ? '#f85149' 
                  : videoStatus === VideoStatus.Playing 
                    ? '#3fb950' 
                    : '#58a6ff',
              }}
            />
          )}

          {/* More menu button */}
          <IconButton
            onClick={handleMenuOpen}
            sx={moreMenuButtonStyle}
            size="small"
          >
            <MoreHorizIcon fontSize="small" />
          </IconButton>

          {/* Media display */}
          <Box sx={mediaBoxStyle}>{renderMedia()}</Box>

          {/* Prompt display - improved styling */}
          {mediaItem.prompt && (
            <Box sx={promptContainerStyle}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <FormatQuoteIcon sx={{ fontSize: 16, color: '#58a6ff', opacity: 0.6, mt: 0.25, transform: 'scaleX(-1)' }} />
                <Typography 
                  variant="body2" 
                  sx={promptTextStyle}
                  title={mediaItem.prompt}
                >
                  {mediaItem.prompt}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Error display - improved styling */}
          {hasError && (
            <Alert 
              severity="error" 
              icon={<ErrorIcon sx={{ fontSize: 18 }} />}
              sx={errorAlertStyle}
            >
              {mediaItem.error || videoError}
            </Alert>
          )}
        </Box>

        {/* Actions section - redesigned */}
        <Box sx={actionsContainerStyle}>
          <Box sx={{ p: 1.5 }}>
            <Box display="flex" gap={1}>
              {mediaItem.type === MediaType.Image ? (
                <>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    startIcon={<AutoFixHighIcon sx={{ fontSize: 20 }} />} 
                    onClick={() => setTransformOpen(true)} 
                    sx={btnPrimary}
                  >
                    Transform
                  </Button>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    startIcon={<AnimationIcon sx={{ fontSize: 20 }} />} 
                    onClick={() => setAnimateOpen(true)} 
                    sx={btnSecondary}
                  >
                    Animate
                  </Button>
                </>
              ) : (
                <>
                  {mediaItem.parent && (
                    <Button 
                      variant="outlined" 
                      fullWidth 
                      startIcon={retrying ? <CircularProgress size={18} sx={{ color: 'inherit' }} /> : <RefreshIcon sx={{ fontSize: 20 }} />} 
                      onClick={handleRetry}
                      disabled={retrying}
                      sx={btnOutlined}
                    >
                      {retrying ? 'Retrying...' : 'Regenerate'}
                    </Button>
                  )}
                  <Tooltip title="Download video" arrow>
                    <Button 
                      variant="contained" 
                      fullWidth={!mediaItem.parent}
                      startIcon={<DownloadIcon sx={{ fontSize: 20 }} />} 
                      onClick={handleDownload}
                      sx={btnDownload}
                    >
                      Download
                    </Button>
                  </Tooltip>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Card>

      {/* Dropdown Menu for secondary actions */}
      <Menu
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: menuPaperStyle
        }}
      >
        {mediaItem.type === MediaType.Image && (
          <MenuItem onClick={() => { setAnimateStoryOpen(true); handleMenuClose(); }} sx={menuItemStyle}>
            <ListItemIcon><AutoStoriesIcon sx={{ fontSize: 18, color: '#58a6ff' }} /></ListItemIcon>
            <ListItemText primary="Create Story" primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </MenuItem>
        )}
        {mediaItem.parent && mediaItem.prompt && mediaItem.type === MediaType.Image && (
          <MenuItem onClick={handleRetry} disabled={retrying} sx={menuItemStyle}>
            <ListItemIcon>
              {retrying ? <CircularProgress size={18} sx={{ color: '#3fb950' }} /> : <RefreshIcon sx={{ fontSize: 18, color: '#3fb950' }} />}
            </ListItemIcon>
            <ListItemText primary={retrying ? 'Retrying...' : 'Retry Generation'} primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </MenuItem>
        )}
        <Divider sx={{ borderColor: 'rgba(48, 54, 61, 0.8)', my: 0.5 }} />
        <MenuItem onClick={() => { onDelete(mediaItem); handleMenuClose(); }} sx={{ ...menuItemStyle, color: '#f85149' }}>
          <ListItemIcon><DeleteIcon sx={{ fontSize: 18, color: '#f85149' }} /></ListItemIcon>
          <ListItemText primary="Delete" primaryTypographyProps={{ fontSize: '0.875rem' }} />
        </MenuItem>
      </Menu>

      {/* Dialogs */}
      <PhotoTransformDialog 
        open={transformOpen} 
        onClose={() => setTransformOpen(false)} 
        mediaItem={mediaItem} 
        addMediaItem={item => { addMediaItem(item); setTransformOpen(false); }} 
        updateMediaItem={item => { updateMediaItem(item); setTransformOpen(false); }} 
      />
      <PhotoAnimateDialog 
        open={animateOpen} 
        onClose={() => setAnimateOpen(false)} 
        mediaItem={isVideo && mediaItem.parent ? mediaItem.parent : mediaItem} 
        initialPrompt={isVideo ? mediaItem.prompt : undefined}
        addMediaItem={item => { addMediaItem(item); setAnimateOpen(false); }} 
        updateMediaItem={item => { updateMediaItem(item); setAnimateOpen(false); }} 
      />
      <AnimateStoryDialog 
        open={animateStoryOpen} 
        onClose={() => setAnimateStoryOpen(false)} 
        mediaItem={mediaItem} 
        addMediaItem={item => { addMediaItem(item); setAnimateStoryOpen(false); }} 
        updateMediaItem={item => { updateMediaItem(item); setAnimateStoryOpen(false); }} 
      />
    </>
  );
};

// Styles
const mediaContainer = { 
  display: 'flex', 
  flexDirection: 'column', 
  justifyContent: 'center', 
  alignItems: 'center', 
  height: '100%', 
  gap: 1, 
  maxHeight: '100%', 
  overflow: 'hidden' 
};

const loadingPulseStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(88, 166, 255, 0.15) 0%, transparent 70%)',
    animation: 'pulse 2s ease-in-out infinite',
  },
  '@keyframes pulse': {
    '0%, 100%': { transform: 'scale(1)', opacity: 1 },
    '50%': { transform: 'scale(1.2)', opacity: 0.5 },
  }
};

const fabPlayStyle = { 
  position: 'absolute', 
  top: '50%', 
  left: '50%', 
  transform: 'translate(-50%, -50%)', 
  zIndex: 3,
  width: 72,
  height: 72,
  background: 'linear-gradient(135deg, rgba(88, 166, 255, 0.9) 0%, rgba(163, 113, 247, 0.9) 100%)',
  backdropFilter: 'blur(8px)',
  border: '2px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(88, 166, 255, 0.4)',
  color: '#fff',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translate(-50%, -50%) scale(1.08)',
    boxShadow: '0 12px 40px rgba(88, 166, 255, 0.5)',
  }
};

const imgStyle: React.CSSProperties = { 
  maxWidth: '100%', 
  maxHeight: '100%', 
  objectFit: 'contain',
  borderRadius: 4
};

const loadingOverlay = { 
  position: 'absolute', 
  top: 0, 
  left: 0, 
  width: '100%', 
  height: '100%', 
  display: 'flex', 
  flexDirection: 'column', 
  alignItems: 'center', 
  justifyContent: 'center', 
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  backdropFilter: 'blur(4px)',
  zIndex: 5 
};

const cardStyle = { 
  width: '100%', 
  maxWidth: '100%',
  height: '100%',
  maxHeight: '100%',
  bgcolor: 'rgba(22, 27, 34, 0.95)', 
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden', 
  border: '1px solid rgba(48, 54, 61, 0.6)',
  borderRadius: 3,
  backdropFilter: 'blur(8px)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
};

const mediaBoxStyle = { 
  flex: 1, 
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  overflow: 'hidden', 
  minHeight: 0,
  position: 'relative',
  bgcolor: '#0d1117'
};

const timerChipStyle = {
  position: 'absolute', 
  top: 12, 
  left: 12, 
  zIndex: 10, 
  bgcolor: 'rgba(13, 17, 23, 0.85)', 
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(48, 54, 61, 0.5)',
  color: '#e6edf3',
  fontWeight: 600,
  fontSize: '0.75rem',
  height: 28
};

const statusChipStyle = {
  position: 'absolute', 
  top: 12, 
  right: 48, 
  zIndex: 10,
  fontWeight: 600,
  fontSize: '0.7rem',
  textTransform: 'capitalize',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(48, 54, 61, 0.5)',
  height: 24
};

const moreMenuButtonStyle = {
  position: 'absolute',
  top: 8,
  right: 8,
  zIndex: 10,
  bgcolor: 'rgba(13, 17, 23, 0.85)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(48, 54, 61, 0.5)',
  color: '#8b949e',
  transition: 'all 0.2s ease',
  '&:hover': {
    bgcolor: 'rgba(33, 38, 45, 0.95)',
    color: '#e6edf3'
  }
};

const promptContainerStyle = {
  px: 2,
  py: 1.5,
  bgcolor: 'rgba(13, 17, 23, 0.95)',
  borderTop: '1px solid rgba(48, 54, 61, 0.5)',
  backdropFilter: 'blur(4px)'
};

const promptTextStyle = {
  color: '#c9d1d9',
  fontSize: '0.813rem',
  lineHeight: 1.5,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  wordBreak: 'break-word',
  fontStyle: 'italic'
};

const errorAlertStyle = {
  borderRadius: 0,
  bgcolor: 'rgba(248, 81, 73, 0.1)',
  borderTop: '1px solid rgba(248, 81, 73, 0.3)',
  color: '#f85149',
  py: 1,
  '& .MuiAlert-icon': { color: '#f85149' },
  '& .MuiAlert-message': { fontSize: '0.813rem' }
};

const actionsContainerStyle = {
  borderTop: '1px solid rgba(48, 54, 61, 0.5)',
  bgcolor: 'rgba(13, 17, 23, 0.95)',
  backdropFilter: 'blur(8px)',
  flexShrink: 0,
  paddingBottom: 'max(8px, env(safe-area-inset-bottom))'
};

const btnPrimary = { 
  minHeight: 44, 
  background: 'linear-gradient(135deg, #238636 0%, #2ea043 100%)',
  color: 'white', 
  fontWeight: 600,
  fontSize: '0.875rem',
  py: 1.25,
  borderRadius: 2,
  textTransform: 'none',
  boxShadow: '0 4px 12px rgba(35, 134, 54, 0.3)',
  transition: 'all 0.2s ease',
  '&:hover': { 
    background: 'linear-gradient(135deg, #2ea043 0%, #3fb950 100%)',
    boxShadow: '0 6px 16px rgba(35, 134, 54, 0.4)',
    transform: 'translateY(-1px)'
  },
  '&:disabled': { 
    background: 'rgba(35, 134, 54, 0.5)',
    color: 'rgba(255, 255, 255, 0.5)'
  }
};

const btnSecondary = { 
  minHeight: 44, 
  background: 'linear-gradient(135deg, #8957e5 0%, #a371f7 100%)',
  color: 'white', 
  fontWeight: 600,
  fontSize: '0.875rem',
  py: 1.25,
  borderRadius: 2,
  textTransform: 'none',
  boxShadow: '0 4px 12px rgba(137, 87, 229, 0.3)',
  transition: 'all 0.2s ease',
  '&:hover': { 
    background: 'linear-gradient(135deg, #a371f7 0%, #b392f9 100%)',
    boxShadow: '0 6px 16px rgba(137, 87, 229, 0.4)',
    transform: 'translateY(-1px)'
  },
  '&:disabled': { 
    background: 'rgba(137, 87, 229, 0.5)',
    color: 'rgba(255, 255, 255, 0.5)'
  }
};

const btnOutlined = { 
  minHeight: 44, 
  borderColor: 'rgba(88, 166, 255, 0.4)', 
  color: '#58a6ff', 
  fontWeight: 600,
  fontSize: '0.875rem',
  py: 1.25,
  borderRadius: 2,
  textTransform: 'none',
  transition: 'all 0.2s ease',
  '&:hover': { 
    borderColor: '#58a6ff', 
    bgcolor: 'rgba(88, 166, 255, 0.1)',
    transform: 'translateY(-1px)'
  },
  '&:disabled': { 
    borderColor: 'rgba(88, 166, 255, 0.2)', 
    color: 'rgba(88, 166, 255, 0.5)'
  }
};

const btnDownload = { 
  minHeight: 44, 
  background: 'linear-gradient(135deg, #238636 0%, #2ea043 100%)',
  color: 'white', 
  fontWeight: 600,
  fontSize: '0.875rem',
  py: 1.25,
  borderRadius: 2,
  textTransform: 'none',
  boxShadow: '0 4px 12px rgba(35, 134, 54, 0.3)',
  transition: 'all 0.2s ease',
  '&:hover': { 
    background: 'linear-gradient(135deg, #2ea043 0%, #3fb950 100%)',
    boxShadow: '0 6px 16px rgba(35, 134, 54, 0.4)',
    transform: 'translateY(-1px)'
  }
};

const menuPaperStyle = {
  bgcolor: 'rgba(22, 27, 34, 0.98)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(48, 54, 61, 0.6)',
  borderRadius: 2,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
  minWidth: 180,
  mt: 1
};

const menuItemStyle = {
  py: 1.25,
  px: 2,
  color: '#e6edf3',
  transition: 'all 0.15s ease',
  '&:hover': {
    bgcolor: 'rgba(88, 166, 255, 0.1)'
  }
};

export default MediaItemComponent;
