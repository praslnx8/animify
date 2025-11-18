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
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import {
  Box, Card, CircularProgress, IconButton, Tooltip, Typography, Button, 
  Collapse, Chip, Fab, Alert, Divider
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
  const [showActions, setShowActions] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<HTMLSpanElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [videoKey, setVideoKey] = useState(0);
  const [videoStatus, setVideoStatus] = useState<VideoStatus>(VideoStatus.Idle);
  const [videoError, setVideoError] = useState<string | null>(null);

  const isVideo = mediaItem.type === MediaType.Video;
  const hasError = mediaItem.error || videoError;

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
    try {
      if (mediaItem.type === MediaType.Video) {
        // For videos, open the animate dialog with the prompt
        setAnimateOpen(true);
      } else {
        // For images, retry silently with same parameters
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

  const renderMedia = () => {
    if (mediaItem.loading) {
      return (
        <Box sx={mediaContainer}>
          <CircularProgress size={60} thickness={4} sx={{ color: '#58a6ff' }} />
          <Typography variant="body2" color="#8b949e" mt={2}>
            Generating your content...
          </Typography>
        </Box>
      );
    }

    if (isVideo) {
      const showThumbnail = videoStatus === VideoStatus.Idle || videoStatus === VideoStatus.Ended || videoStatus === VideoStatus.Error;
      
      return (
        <Box sx={{ ...mediaContainer, bgcolor: '#000', position: 'relative' }}>
          {/* Thumbnail layer */}
          {showThumbnail && mediaItem.parent?.url && (
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={mediaItem.parent.url} alt="Video thumbnail" style={imgStyle} />
              <Fab 
                color="primary" 
                onClick={handlePlay} 
                sx={fabCenter}
                size="large"
              >
                <PlayArrowIcon sx={{ fontSize: 32 }} />
              </Fab>
            </Box>
          )}

          {/* Video layer */}
          {videoStatus === VideoStatus.Loading && (
            <Box sx={loadingOverlay}>
              <CircularProgress size={60} thickness={4} sx={{ color: '#58a6ff' }} />
              <Typography variant="body2" color="white" mt={2}>
                Loading video...
              </Typography>
            </Box>
          )}

          {(videoStatus === VideoStatus.Loading || videoStatus === VideoStatus.Playing) && (
            <video
              key={videoKey}
              ref={videoRef}
              controls
              playsInline
              autoPlay
              style={{
                ...imgStyle,
                display: videoStatus === VideoStatus.Playing ? 'block' : 'none',
              }}
              src={getVideoUrlWithCacheBuster()}
              onLoadedData={() => setVideoStatus(VideoStatus.Playing)}
              onError={() => {
                setVideoStatus(VideoStatus.Error);
                setVideoError('Failed to load video. Please try again.');
              }}
              onEnded={() => setVideoStatus(VideoStatus.Ended)}
            />
          )}
        </Box>
      );
    }

    return (
      <Box sx={{ ...mediaContainer, bgcolor: '#000' }}>
        <img src={mediaItem.url} alt="Media" style={imgStyle} />
      </Box>
    );
  };

  return (
    <>
      <Card sx={cardStyle}>
        <Box sx={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* Status indicators */}
          {isVideo && mediaItem.createdAt && (
            <Chip 
              label={
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Typography variant="caption" component="span">⏱</Typography>
                  <span ref={timerRef}>00:00</span>
                </Box>
              }
              size="small" 
              sx={{ 
                position: 'absolute', 
                top: 8, 
                left: 8, 
                zIndex: 10, 
                bgcolor: 'rgba(0,0,0,0.8)', 
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.75rem'
              }} 
            />
          )}
          
          {isVideo && videoStatus !== VideoStatus.Idle && videoStatus !== VideoStatus.Ended && (
            <Chip 
              label={videoStatus} 
              color={videoStatus === VideoStatus.Error ? 'error' : videoStatus === VideoStatus.Playing ? 'success' : 'default'} 
              size="small" 
              sx={{ 
                position: 'absolute', 
                top: 8, 
                right: 8, 
                zIndex: 10,
                fontWeight: 600,
                textTransform: 'capitalize'
              }} 
            />
          )}

          {/* Media display */}
          <Box sx={mediaBoxStyle}>{renderMedia()}</Box>

          {/* Prompt display */}
          {mediaItem.prompt && (
            <Box px={2} py={1.5} bgcolor="rgba(0,0,0,0.9)" sx={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <Typography 
                variant="body2" 
                sx={{
                  color: '#e6edf3',
                  fontSize: '0.813rem',
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  wordBreak: 'break-word'
                }}
                title={mediaItem.prompt}
              >
                {mediaItem.prompt}
              </Typography>
            </Box>
          )}

          {/* Error display */}
          {hasError && (
            <Alert 
              severity="error" 
              icon={<ErrorIcon />}
              sx={{ 
                borderRadius: 0,
                bgcolor: 'rgba(218, 54, 51, 0.1)',
                border: '1px solid #da3633',
                '& .MuiAlert-message': { fontSize: '0.813rem' }
              }}
            >
              {mediaItem.error || videoError}
            </Alert>
          )}
        </Box>

        {/* Actions section */}
        <Box sx={{ borderTop: 1, borderColor: '#30363d', bgcolor: '#0d1117' }}>
          {/* Primary actions */}
          <Box sx={{ p: 1.5 }}>
            <Box display="flex" gap={1}>
              {mediaItem.type === MediaType.Image ? (
                <>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    startIcon={<AutoFixHighIcon />} 
                    onClick={() => setTransformOpen(true)} 
                    sx={btnGreen}
                    size="large"
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    startIcon={<AnimationIcon />} 
                    onClick={() => setAnimateOpen(true)} 
                    sx={btnPurple}
                    size="large"
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
                      startIcon={retrying ? <CircularProgress size={16} /> : <RefreshIcon />} 
                      onClick={handleRetry}
                      disabled={retrying}
                      sx={btnOutlinedBlue}
                      size="large"
                    >
                      {retrying ? 'Retrying...' : 'Retry'}
                    </Button>
                  )}
                  <Tooltip title="Download video">
                    <Button 
                      variant="outlined" 
                      fullWidth={!mediaItem.parent}
                      startIcon={<DownloadIcon />} 
                      onClick={handleDownload}
                      sx={btnOutlinedGreen}
                      size="large"
                    >
                      Download
                    </Button>
                  </Tooltip>
                </>
              )}
            </Box>
          </Box>

          {/* Secondary actions - collapsible */}
          {mediaItem.type === MediaType.Image && (
            <>
              <Divider sx={{ borderColor: '#30363d' }} />
              <Box>
                <Button
                  fullWidth
                  onClick={() => setShowActions(!showActions)}
                  endIcon={
                    <ExpandMoreIcon 
                      sx={{ 
                        transform: showActions ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s'
                      }} 
                    />
                  }
                  sx={{ 
                    color: '#8b949e', 
                    fontSize: '0.813rem',
                    py: 1,
                    '&:hover': { bgcolor: 'rgba(88, 166, 255, 0.1)' }
                  }}
                >
                  More Actions
                </Button>
                <Collapse in={showActions}>
                  <Box sx={{ p: 1.5, pt: 0.5 }}>
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Button 
                        variant="outlined" 
                        fullWidth 
                        startIcon={<AutoStoriesIcon />} 
                        onClick={() => setAnimateStoryOpen(true)} 
                        sx={btnOutlinedBlue}
                      >
                        Create Story
                      </Button>
                      {mediaItem.parent && mediaItem.prompt && (
                        <Button 
                          variant="outlined" 
                          fullWidth 
                          startIcon={retrying ? <CircularProgress size={16} /> : <RefreshIcon />} 
                          onClick={handleRetry}
                          disabled={retrying}
                          sx={btnOutlinedGreen}
                        >
                          {retrying ? 'Retrying...' : 'Retry Generation'}
                        </Button>
                      )}
                      <Button 
                        variant="outlined" 
                        fullWidth 
                        startIcon={<DeleteIcon />} 
                        onClick={() => onDelete(mediaItem)}
                        sx={btnOutlinedRed}
                        color="error"
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>
                </Collapse>
              </Box>
            </>
          )}

          {/* Delete button for videos */}
          {mediaItem.type === MediaType.Video && (
            <>
              <Divider sx={{ borderColor: '#30363d' }} />
              <Box sx={{ p: 1.5, pt: 1 }}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  startIcon={<DeleteIcon />} 
                  onClick={() => onDelete(mediaItem)}
                  sx={btnOutlinedRed}
                  color="error"
                >
                  Delete
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Card>

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
  gap: 2, 
  maxHeight: '100%', 
  overflow: 'hidden' 
};

const fabCenter = { 
  position: 'absolute', 
  top: '50%', 
  left: '50%', 
  transform: 'translate(-50%, -50%)', 
  zIndex: 3,
  boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
};

const imgStyle: React.CSSProperties = { 
  maxWidth: '100%', 
  maxHeight: '100%', 
  objectFit: 'contain' 
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
  backgroundColor: 'rgba(0,0,0,0.8)', 
  zIndex: 5 
};

const cardStyle = { 
  width: '100%', 
  height: '100%', 
  bgcolor: '#161b22', 
  display: 'grid', 
  gridTemplateRows: '1fr auto', 
  overflow: 'hidden', 
  border: '1px solid #30363d',
  borderRadius: 2
};

const mediaBoxStyle = { 
  flex: 1, 
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  overflow: 'hidden', 
  minHeight: 0,
  position: 'relative'
};

const btnGreen = { 
  minHeight: 44, 
  bgcolor: '#238636', 
  color: 'white', 
  fontWeight: 600,
  '&:hover': { bgcolor: '#2ea043' },
  '&:disabled': { bgcolor: '#238636', opacity: 0.5 }
};

const btnPurple = { 
  minHeight: 44, 
  bgcolor: '#8957e5', 
  color: 'white', 
  fontWeight: 600,
  '&:hover': { bgcolor: '#a475f9' },
  '&:disabled': { bgcolor: '#8957e5', opacity: 0.5 }
};

const btnOutlinedBlue = { 
  minHeight: 44, 
  borderColor: '#30363d', 
  color: '#58a6ff', 
  fontWeight: 600,
  '&:hover': { 
    borderColor: '#58a6ff', 
    bgcolor: 'rgba(88, 166, 255, 0.1)' 
  },
  '&:disabled': { 
    borderColor: '#30363d', 
    color: '#58a6ff',
    opacity: 0.5 
  }
};

const btnOutlinedGreen = { 
  minHeight: 44, 
  borderColor: '#30363d', 
  color: '#3fb950', 
  fontWeight: 600,
  '&:hover': { 
    borderColor: '#3fb950', 
    bgcolor: 'rgba(63, 185, 80, 0.1)' 
  },
  '&:disabled': { 
    borderColor: '#30363d', 
    color: '#3fb950',
    opacity: 0.5 
  }
};

const btnOutlinedRed = { 
  minHeight: 40, 
  borderColor: '#30363d', 
  color: '#f85149', 
  fontWeight: 600,
  '&:hover': { 
    borderColor: '#f85149', 
    bgcolor: 'rgba(248, 81, 73, 0.1)' 
  }
};

export default MediaItemComponent;
