'use client';

import {
  Animation as AnimationIcon,
  AutoFixHigh as AutoFixHighIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  PlayArrow as PlayArrowIcon,
  AutoStories as AutoStoriesIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Fab,
  Snackbar,
  Alert,
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

import { downloadMedia } from '../api/downloadMedia';
import { MediaItem } from '../models/MediaItem';
import { MediaType } from '../models/MediaType';
import PhotoAnimateDialog, { silentPhotoAnimate } from './PhotoAnimateDialog';
import PhotoTransformDialog, { silentPhotoTransform } from './PhotoTransformDialog';
import AnimateStoryDialog from './AnimateStoryDialog';

// Enum for video status
enum VideoStatus {
  Idle = 'idle',
  Loading = 'loading',
  Playing = 'playing',
  Ended = 'ended',
  Error = 'error',
}

interface MediaItemProps {
  mediaItem: MediaItem;
  addMediaItem: (item: MediaItem) => void;
  updateMediaItem: (item: MediaItem) => void;
  onDelete: (item: MediaItem) => void;
}

const MediaItemComponent: React.FC<MediaItemProps> = ({
  mediaItem,
  addMediaItem,
  updateMediaItem,
  onDelete,
}) => {
  const [transformOpen, setTransformOpen] = useState(false);
  const [animateOpen, setAnimateOpen] = useState(false);
  const [animateStoryOpen, setAnimateStoryOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [showError, setShowError] = useState(false);

  const isVideo = mediaItem.type === MediaType.Video;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoKey, setVideoKey] = React.useState<number>(0);
  const [videoStatus, setVideoStatus] = useState<VideoStatus>(VideoStatus.Idle);
  const [videoError, setVideoError] = useState<string | null>(null);

  useEffect(() => {
    setVideoStatus(VideoStatus.Idle);
    setVideoError(null);
    setShowError(false);
  }, [mediaItem.id]);

  useEffect(() => {
    if (videoError) {
      setShowError(true);
    }
  }, [videoError]);

  const handlePlay = () => {
    setVideoError(null);
    setVideoStatus(VideoStatus.Loading);
    setVideoKey(prevKey => prevKey + 1);
  };

  const handleDownload = () => {
    downloadMedia(mediaItem.url!, mediaItem.id, mediaItem.type === MediaType.Video);
    setMenuAnchor(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleRetry = async () => {
    if (!mediaItem.parent || !mediaItem.prompt) return;
    if (mediaItem.type === MediaType.Image) {
      await silentPhotoTransform({
        parentMediaItem: mediaItem.parent,
        prompt: mediaItem.prompt,
        addMediaItem,
        updateMediaItem,
        modelName: mediaItem.model_name,
        style: mediaItem.style,
        gender: mediaItem.gender,
        bodyType: mediaItem.body_type,
        skinColor: mediaItem.skin_color,
        autoDetectHairColor: mediaItem.auto_detect_hair_color,
        nsfwPolicy: mediaItem.nsfw_policy,
      });
    } else if (mediaItem.type === MediaType.Video) {
      await silentPhotoAnimate({
        parentMediaItem: mediaItem.parent,
        prompt: mediaItem.prompt,
        addMediaItem,
        updateMediaItem,
      });
    } 
  };

  const getVideoUrlWithCacheBuster = () => {
    const separator = mediaItem.url!.includes('?') ? '&' : '?';
    return `${mediaItem.url}${separator}t=${Date.now()}`;
  };

  const handleVideoLoaded = () => {
    setVideoStatus(VideoStatus.Playing);
    videoRef.current?.play();
  };

  const renderMedia = () => {
    if (mediaItem.loading) {
      return (
        <Box 
          sx={{
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%', 
            gap: 2, 
            bgcolor: '#1a1a1a',
            maxHeight: '100%',
            overflow: 'hidden'
          }}
        >
          <CircularProgress size={60} thickness={4} sx={{ color: '#58a6ff' }} />
          <Typography variant="body2" color="#8b949e">
            Generating your content...
          </Typography>
        </Box>
      );
    }
    if (isVideo) {
      return (
        <Box 
          sx={{
            position: 'relative', 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            bgcolor: '#000',
            maxHeight: '100%',
            overflow: 'hidden'
          }}
        >
          {videoStatus === VideoStatus.Loading && (          <Box sx={loadingOverlayStyle}>
            <CircularProgress size={60} thickness={4} sx={{ color: '#58a6ff' }} />
            <Typography variant="body2" color="white" mt={1}>
              Loading video...
            </Typography>
          </Box>
          )}
          {(videoStatus !== VideoStatus.Playing) && (
            <Box position="relative" width="100%" height="100%" display="flex" justifyContent="center" alignItems="center">
              <img
                src={mediaItem.parent?.url}
                alt="Media"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
              {(videoStatus === VideoStatus.Idle || videoStatus === VideoStatus.Ended || videoStatus === VideoStatus.Error) && (
                <Fab
                  color="primary"
                  onClick={handlePlay}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 3,
                  }}
                >
                  <PlayArrowIcon />
                </Fab>
              )}
            </Box>
          )}
          <Box
            sx={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              opacity: videoStatus === VideoStatus.Playing ? 1 : 0,
              zIndex: videoStatus === VideoStatus.Playing ? 2 : 0,
            }}
          >
            {videoStatus !== VideoStatus.Idle && videoStatus !== VideoStatus.Ended && (
              <video
                key={videoKey}
                ref={videoRef}
                width="100%"
                controls
                playsInline
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                src={getVideoUrlWithCacheBuster()}
                onLoadedData={handleVideoLoaded}
                onError={(e) => {
                  console.error('Video error event:', e);
                  setVideoStatus(VideoStatus.Error);
                  setVideoError('Video failed to load. Try playing again later.');
                }}
                onEnded={() => setVideoStatus(VideoStatus.Ended)}
              />)}
          </Box>
          {videoError && (
            <Typography color="error" textAlign="center" p={1} sx={{ position: 'absolute', bottom: 0, width: '100%' }}>
              {videoError}
            </Typography>
          )}
        </Box>
      );
    }
    return (
      <Box 
        sx={{
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          bgcolor: '#000',
          maxHeight: '100%',
          overflow: 'hidden'
        }}
      >
        <img
          src={mediaItem.url}
          alt="Media"
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />
      </Box>
    );
  };

  const renderActions = () => {
    const showRetry = mediaItem.parent && mediaItem.prompt;
    
    return (
      <Box display="flex" flexDirection="column" width="100%" gap={1}>
        {/* Primary Actions */}
        <Box display="flex" gap={1} width="100%">
          {mediaItem.type === MediaType.Image && (
            <>
              <Button
                variant="contained"
                fullWidth
                startIcon={<AutoFixHighIcon />}
                onClick={() => setTransformOpen(true)}
                sx={{ 
                  minHeight: 48,
                  bgcolor: '#238636',
                  color: 'white',
                  '&:hover': {
                    bgcolor: '#2ea043',
                  }
                }}
              >
                Edit
              </Button>
              <Button
                variant="contained"
                fullWidth
                startIcon={<AnimationIcon />}
                onClick={() => setAnimateOpen(true)}
                sx={{ 
                  minHeight: 48,
                  bgcolor: '#8957e5',
                  color: 'white',
                  '&:hover': {
                    bgcolor: '#a475f9',
                  }
                }}
              >
                Animate
              </Button>
            </>
          )}
        </Box>
        
        {/* Secondary Actions */}
        <Box display="flex" gap={1} width="100%" alignItems="center">
          {mediaItem.type === MediaType.Image && (
            <Button
              variant="outlined"
              fullWidth
              startIcon={<AutoStoriesIcon />}
              onClick={() => setAnimateStoryOpen(true)}
              sx={{ 
                minHeight: 40,
                borderColor: '#30363d',
                color: '#58a6ff',
                '&:hover': {
                  borderColor: '#58a6ff',
                  bgcolor: 'rgba(88, 166, 255, 0.1)',
                }
              }}
            >
              Story
            </Button>
          )}
          
          {showRetry && (
            <Button
              variant="outlined"
              fullWidth
              startIcon={<RefreshIcon />}
              onClick={handleRetry}
              sx={{ 
                minHeight: 40,
                borderColor: '#30363d',
                color: '#238636',
                '&:hover': {
                  borderColor: '#238636',
                  bgcolor: 'rgba(35, 134, 54, 0.1)',
                }
              }}
            >
              Retry
            </Button>
          )}
          
          {/* More Actions Menu */}
          <IconButton 
            onClick={handleMenuOpen}
            sx={{ 
              minWidth: 40, 
              minHeight: 40,
              border: 1,
              borderColor: '#30363d',
              color: '#8b949e',
              '&:hover': {
                borderColor: '#58a6ff',
                bgcolor: 'rgba(88, 166, 255, 0.1)',
              }
            }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>
    );
  };

  return (
    <>
      <Card
        sx={{
          width: '100%',
          height: '100%',
          maxHeight: '100%',
          minHeight: 0,
          bgcolor: '#1a1a1a',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #333',
        }}
      >
        <Box 
          sx={{
            flex: 1,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
            minHeight: 0,
            maxHeight: 'calc(100% - 140px)' // Reserve space for action buttons
          }}
        >
          <Box 
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
              width: '100%',
              minHeight: 0,
              maxHeight: '100%'
            }}
          >
            {renderMedia()}
          </Box>
          {mediaItem.prompt && (
            <Box px={2} py={1} bgcolor="rgba(0,0,0,0.8)" textAlign="center">
              <Typography variant="body2" noWrap title={mediaItem.prompt} color="#fff" fontSize="0.875rem">
                {mediaItem.prompt}
              </Typography>
            </Box>
          )}
          {/* Status Chip */}
          {mediaItem.type === MediaType.Video && videoStatus === VideoStatus.Playing && (
            <Chip
              label="Playing"
              color="success"
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 10,
              }}
            />
          )}
          {mediaItem.type === MediaType.Video && videoStatus === VideoStatus.Ended && (
            <Chip
              label="Ended"
              color="default"
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 10,
              }}
            />
          )}
          {mediaItem.type === MediaType.Video && videoStatus === VideoStatus.Error && (
            <Chip
              label="Error"
              color="error"
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 10,
              }}
            />
          )}
        </Box>
        <Box sx={{ 
          flexShrink: 0,
          width: '100%', 
          p: 2,
          height: 160, // Fixed height for action buttons
          borderTop: 1, 
          borderColor: '#333', 
          bgcolor: '#0d1117' 
        }}>
          {renderActions()}
        </Box>
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            bgcolor: '#21262d',
            border: '1px solid #30363d',
            '& .MuiMenuItem-root': {
              color: '#e6edf3',
              '&:hover': {
                bgcolor: 'rgba(88, 166, 255, 0.1)',
              }
            }
          }
        }}
      >
        {mediaItem.type === MediaType.Video && (
          <MenuItem onClick={handleDownload}>
            <ListItemIcon>
              <DownloadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Download Video" />
          </MenuItem>
        )}
        <MenuItem onClick={() => { onDelete(mediaItem); handleMenuClose(); }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
      </Menu>

      {/* Error Snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowError(false)}
          severity="error"
          sx={{ 
            width: '100%',
            bgcolor: '#da3633',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white'
            }
          }}
        >
          {videoError}
        </Alert>
      </Snackbar>

      <PhotoTransformDialog
        open={transformOpen}
        onClose={() => setTransformOpen(false)}
        mediaItem={mediaItem}
        addMediaItem={(item) => {
          addMediaItem(item);
          setTransformOpen(false);
        }}
        updateMediaItem={(item) => {
          updateMediaItem(item);
          setTransformOpen(false);
        }}
      />

      <PhotoAnimateDialog
        open={animateOpen}
        onClose={() => setAnimateOpen(false)}
        mediaItem={mediaItem}
        addMediaItem={(item) => {
          addMediaItem(item);
          setAnimateOpen(false);
        }}
        updateMediaItem={(item) => {
          updateMediaItem(item);
          setAnimateOpen(false);
        }}
      />

      <AnimateStoryDialog
        open={animateStoryOpen}
        onClose={() => setAnimateStoryOpen(false)}
        mediaItem={mediaItem}
        addMediaItem={(item) => {
          addMediaItem(item);
          setAnimateStoryOpen(false);
        }}
        updateMediaItem={(item) => {
          updateMediaItem(item);
          setAnimateStoryOpen(false);
        }}
      />
    </>
  );
};

// Styles
const loadingOverlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0,0,0,0.7)',
  zIndex: 2,
};

export default MediaItemComponent;
