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
  Box, Card, CircularProgress, IconButton, Tooltip, Typography, Button, Menu, MenuItem,
  ListItemIcon, ListItemText, Chip, Fab, Snackbar, Alert
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

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
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [showError, setShowError] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoKey, setVideoKey] = useState(0);
  const [videoStatus, setVideoStatus] = useState<VideoStatus>(VideoStatus.Idle);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [timeElapsed, setTimeElapsed] = useState<string>('');

  const isVideo = mediaItem.type === MediaType.Video;

  useEffect(() => {
    setVideoStatus(VideoStatus.Idle);
    setVideoError(null);
    setShowError(false);
  }, [mediaItem.id]);

  useEffect(() => { if (videoError) setShowError(true); }, [videoError]);

  useEffect(() => {
    if (!isVideo || !mediaItem.createdAt) return;

    const updateTimeElapsed = () => {
      const now = Date.now();
      const diff = now - mediaItem.createdAt!;
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) setTimeElapsed(`${days}d ago`);
      else if (hours > 0) setTimeElapsed(`${hours}h ago`);
      else if (minutes > 0) setTimeElapsed(`${minutes}m ago`);
      else setTimeElapsed(`${seconds}s ago`);
    };

    updateTimeElapsed();
    const interval = setInterval(updateTimeElapsed, 100000); // Update every 100 seconds
    return () => clearInterval(interval);
  }, [isVideo, mediaItem.createdAt]);

  const handlePlay = () => {
    setVideoError(null);
    setVideoStatus(VideoStatus.Loading);
    setVideoKey(k => k + 1);
  };

  const handleDownload = () => {
    downloadMedia(mediaItem.url!, mediaItem.id, isVideo);
    setMenuAnchor(null);
  };

  const handleRetry = async () => {
    if (!mediaItem.parent || !mediaItem.prompt) return;
    
    if (mediaItem.type === MediaType.Video) {
      // For videos, open the animate dialog with the prompt
      setAnimateOpen(true);
    } else {
      // For images, retry silently with same parameters
      const commonProps = { parentMediaItem: mediaItem.parent, prompt: mediaItem.prompt, addMediaItem, updateMediaItem };
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
  };

  const getVideoUrlWithCacheBuster = () => `${mediaItem.url}${mediaItem.url!.includes('?') ? '&' : '?'}t=${Date.now()}`;

  const renderMedia = () => {
    if (mediaItem.loading) return (
      <Box sx={mediaContainer}><CircularProgress size={60} thickness={4} sx={{ color: '#58a6ff' }} />
        <Typography variant="body2" color="#8b949e">Generating your content...</Typography></Box>
    );
    if (isVideo) return (
      <Box sx={{ ...mediaContainer, bgcolor: '#000' }}>
        {videoStatus === VideoStatus.Loading && <Box sx={loadingOverlay}><CircularProgress size={60} thickness={4} sx={{ color: '#58a6ff' }} /><Typography variant="body2" color="white" mt={1}>Loading video...</Typography></Box>}
        {videoStatus !== VideoStatus.Playing && (
          <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
            <img src={mediaItem.parent?.url} alt="Media" style={imgStyle} />
            {[VideoStatus.Idle, VideoStatus.Ended, VideoStatus.Error].includes(videoStatus) && (
              <Fab color="primary" onClick={handlePlay} sx={fabCenter}><PlayArrowIcon /></Fab>
            )}
          </Box>
        )}
        <Box sx={{ ...videoOverlay, opacity: videoStatus === VideoStatus.Playing ? 1 : 0 }}>
          {![VideoStatus.Idle, VideoStatus.Ended].includes(videoStatus) && (
            <video
              key={videoKey}
              ref={videoRef}
              controls
              playsInline
              style={imgStyle}
              src={getVideoUrlWithCacheBuster()}
              onLoadedData={() => { setVideoStatus(VideoStatus.Playing); videoRef.current?.play(); }}
              onError={() => { setVideoStatus(VideoStatus.Error); setVideoError('Video failed to load. Try again.'); }}
              onEnded={() => setVideoStatus(VideoStatus.Ended)}
            />
          )}
        </Box>
        {videoError && <Typography color="error" textAlign="center" p={1} sx={{ position: 'absolute', bottom: 0, width: '100%' }}>{videoError}</Typography>}
      </Box>
    );
    return <Box sx={{ ...mediaContainer, bgcolor: '#000' }}><img src={mediaItem.url} alt="Media" style={imgStyle} /></Box>;
  };

  return (
    <>
      <Card sx={cardStyle}>
        <Box sx={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Box sx={mediaBoxStyle}>{renderMedia()}</Box>
          {mediaItem.prompt && <Box px={2} py={1} bgcolor="rgba(0,0,0,0.8)" textAlign="center"><Typography variant="body2" noWrap title={mediaItem.prompt} color="#fff" fontSize="0.875rem">{mediaItem.prompt}</Typography></Box>}
          {isVideo && videoStatus !== VideoStatus.Idle && <Chip label={videoStatus} color={videoStatus === VideoStatus.Error ? 'error' : videoStatus === VideoStatus.Playing ? 'success' : 'default'} size="small" sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }} />}
          {isVideo && timeElapsed && <Chip label={timeElapsed} size="small" sx={{ position: 'absolute', top: 8, left: 8, zIndex: 10, bgcolor: 'rgba(0,0,0,0.7)', color: '#fff' }} />}
        </Box>
        <Box sx={{ p: 2, borderTop: 1, borderColor: '#333', bgcolor: '#0d1117' }}>{/* Actions */}
          <Box display="flex" flexDirection="column" width="100%" gap={1}>
            <Box display="flex" gap={1}>{mediaItem.type === MediaType.Image && (
              <>
                <Button variant="contained" fullWidth startIcon={<AutoFixHighIcon />} onClick={() => setTransformOpen(true)} sx={btnGreen}>Edit</Button>
                <Button variant="contained" fullWidth startIcon={<AnimationIcon />} onClick={() => setAnimateOpen(true)} sx={btnPurple}>Animate</Button>
              </>
            )}</Box>
            <Box display="flex" gap={1} alignItems="center">
              {mediaItem.type === MediaType.Image && <Button variant="outlined" fullWidth startIcon={<AutoStoriesIcon />} onClick={() => setAnimateStoryOpen(true)} sx={btnOutlinedBlue}>Story</Button>}
              {mediaItem.parent && mediaItem.prompt && <Button variant="outlined" fullWidth startIcon={<RefreshIcon />} onClick={handleRetry} sx={btnOutlinedGreen}>Retry</Button>}
              <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} sx={btnIconMenu}><MoreVertIcon /></IconButton>
            </Box>
          </Box>
        </Box>
      </Card>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: menuStyle }}>
        {isVideo && <MenuItem onClick={handleDownload}><ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon><ListItemText primary="Download Video" /></MenuItem>}
        <MenuItem onClick={() => { onDelete(mediaItem); setMenuAnchor(null); }}><ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon><ListItemText primary="Delete" /></MenuItem>
      </Menu>

      <Snackbar open={showError} autoHideDuration={6000} onClose={() => setShowError(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setShowError(false)} severity="error" sx={alertStyle}>{videoError}</Alert>
      </Snackbar>

      <PhotoTransformDialog open={transformOpen} onClose={() => setTransformOpen(false)} mediaItem={mediaItem} addMediaItem={item => { addMediaItem(item); setTransformOpen(false); }} updateMediaItem={item => { updateMediaItem(item); setTransformOpen(false); }} />
      <PhotoAnimateDialog open={animateOpen} onClose={() => setAnimateOpen(false)} mediaItem={isVideo && mediaItem.parent ? mediaItem.parent : mediaItem} addMediaItem={item => { addMediaItem(item); setAnimateOpen(false); }} updateMediaItem={item => { updateMediaItem(item); setAnimateOpen(false); }} />
      <AnimateStoryDialog open={animateStoryOpen} onClose={() => setAnimateStoryOpen(false)} mediaItem={mediaItem} addMediaItem={item => { addMediaItem(item); setAnimateStoryOpen(false); }} updateMediaItem={item => { updateMediaItem(item); setAnimateStoryOpen(false); }} />
    </>
  );
};

// Styles
const mediaContainer = { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 2, maxHeight: '100%', overflow: 'hidden' };
const videoOverlay = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2 };
const fabCenter = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 3 };
const imgStyle = { maxWidth: '100%', maxHeight: '100%' };
const loadingOverlay = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 2 };
const cardStyle = { width: '100%', height: '100%', bgcolor: '#1a1a1a', display: 'grid', gridTemplateRows: '1fr auto', overflow: 'hidden', border: '1px solid #333' };
const mediaBoxStyle = { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', minHeight: 0 };
const btnGreen = { minHeight: 48, bgcolor: '#238636', color: 'white', '&:hover': { bgcolor: '#2ea043' } };
const btnPurple = { minHeight: 48, bgcolor: '#8957e5', color: 'white', '&:hover': { bgcolor: '#a475f9' } };
const btnOutlinedBlue = { minHeight: 40, borderColor: '#30363d', color: '#58a6ff', '&:hover': { borderColor: '#58a6ff', bgcolor: 'rgba(88, 166, 255, 0.1)' } };
const btnOutlinedGreen = { minHeight: 40, borderColor: '#30363d', color: '#238636', '&:hover': { borderColor: '#238636', bgcolor: 'rgba(35, 134, 54, 0.1)' } };
const btnIconMenu = { minWidth: 40, minHeight: 40, border: 1, borderColor: '#30363d', color: '#8b949e', '&:hover': { borderColor: '#58a6ff', bgcolor: 'rgba(88, 166, 255, 0.1)' } };
const menuStyle = { bgcolor: '#21262d', border: '1px solid #30363d', '& .MuiMenuItem-root': { color: '#e6edf3', '&:hover': { bgcolor: 'rgba(88, 166, 255, 0.1)' } } };
const alertStyle = { width: '100%', bgcolor: '#da3633', color: 'white', '& .MuiAlert-icon': { color: 'white' } };

export default MediaItemComponent;
