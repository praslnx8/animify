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
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100%" gap={2}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="body2" color="text.secondary">
            Generating your content...
          </Typography>
        </Box>
      );
    }
    if (isVideo) {
      return (
        <Box position="relative" width="100%" flex={1} display="flex" justifyContent="center" alignItems="center">
          {videoStatus === VideoStatus.Loading && (
            <Box sx={loadingOverlayStyle}>
              <CircularProgress size={60} thickness={4} />
              <Typography variant="body2" color="white" mt={1}>
                Loading video...
              </Typography>
            </Box>
          )}
          {(videoStatus !== VideoStatus.Playing) && (
            <Box position="relative" width="100%" height="100%">
              <img
                src={mediaItem.parent?.url}
                alt="Media"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {videoStatus === VideoStatus.Idle && (
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
                height="100%"
                controls
                playsInline
                style={{ objectFit: 'contain' }}
                src={getVideoUrlWithCacheBuster()}
                onLoadedData={handleVideoLoaded}
                onError={(e) => {
                  console.error('Video error event:', e);
                  setVideoStatus(VideoStatus.Error);
                  setVideoError('Video failed to load. Try playing again later.');
                }}
              />)}
          </Box>
        </Box>
      );
    }
    return (
      <img
        src={mediaItem.url}
        alt="Media"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
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
                color="primary"
                fullWidth
                startIcon={<AutoFixHighIcon />}
                onClick={() => setTransformOpen(true)}
                sx={{ minHeight: 48 }}
              >
                Edit
              </Button>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                startIcon={<AnimationIcon />}
                onClick={() => setAnimateOpen(true)}
                sx={{ minHeight: 48 }}
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
              color="info"
              fullWidth
              startIcon={<AutoStoriesIcon />}
              onClick={() => setAnimateStoryOpen(true)}
              sx={{ minHeight: 40 }}
            >
              Story
            </Button>
          )}
          
          {showRetry && (
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              startIcon={<RefreshIcon />}
              onClick={handleRetry}
              sx={{ minHeight: 40 }}
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
              borderColor: 'divider'
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
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box flex={3} width="100%" display="flex" flexDirection="column" overflow="hidden" position="relative">
          <Box flex={1} display="flex" justifyContent="center" alignItems="center" overflow="hidden" width="100%">
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
        </Box>
        <Box flex={1} width="100%" display="flex" flexDirection="column" p={2} borderTop={1} borderColor="divider" bgcolor="background.default">
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
          sx={{ width: '100%' }}
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
