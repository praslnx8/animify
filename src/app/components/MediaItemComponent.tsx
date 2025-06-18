'use client';

import {
  Animation as AnimationIcon,
  AutoFixHigh as AutoFixHighIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CircularProgress,
  Dialog,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

import { MediaItem } from '../models/MediaItem';
import PhotoAnimateDialog from './PhotoAnimateDialog';
import PhotoTransformDialog from './PhotoTransformDialog';

// Enum for video status
enum VideoStatus {
  Idle = 'idle',
  Loading = 'loading',
  Playing = 'playing',
  Paused = 'paused',
  Ended = 'ended',
  Error = 'error',
}

interface MediaItemProps {
  mediaItem: MediaItem;
  addMediaItem: (item: MediaItem) => void;
  updateMediaItem: (item: MediaItem) => void;
  onDelete: (item: MediaItem) => void;
  onSwipe?: (direction: 'left' | 'right') => void;
  isTopCard?: boolean;
  showActions?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

const MediaItemComponent: React.FC<MediaItemProps> = ({
  mediaItem,
  addMediaItem,
  updateMediaItem,
  onDelete,
  onSwipe,
  isTopCard,
  showActions,
}) => {
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [transformOpen, setTransformOpen] = useState(false);
  const [animateOpen, setAnimateOpen] = useState(false);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const isVideo = mediaItem.type === 'video';
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoStatus, setVideoStatus] = useState<VideoStatus>(VideoStatus.Idle);
  const [videoError, setVideoError] = useState<string | null>(null);

  useEffect(() => {
    setVideoStatus(VideoStatus.Idle);
    setVideoError(null);
  }, [mediaItem.id]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isTopCard) return;
    setTouchStart(e.touches[0].clientX);
    setSwipeOffset(0);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTopCard || touchStart === null) return;
    const offset = e.touches[0].clientX - touchStart;
    setSwipeOffset(offset);
  };
  const handleTouchEnd = () => {
    if (!isTopCard || touchStart === null) return;
    if (swipeOffset > 80 && onSwipe) onSwipe('right');
    else if (swipeOffset < -80 && onSwipe) onSwipe('left');
    setTouchStart(null);
    setSwipeOffset(0);
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (videoStatus === VideoStatus.Playing) {
      videoRef.current.pause();
      setVideoStatus(VideoStatus.Paused);
    } else {
      setVideoStatus(VideoStatus.Loading);
      videoRef.current.play()
        .then(() => setVideoStatus(VideoStatus.Playing))
        .catch(() => setVideoError("Can't play video"));
    }
  };

  const handleDownload = async () => {
    try {
      // Try to download directly if same-origin or CORS is allowed
      const a = document.createElement('a');
      a.href = mediaItem.url!;
      a.download = `media-${mediaItem.id}.${isVideo ? 'mp4' : 'jpg'}`;
      a.target = '_blank'; // Open in new tab
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      // Fallback: try fetch (will fail if CORS is not allowed)
      try {
        const response = await fetch(mediaItem.url!);
        if (!response.ok) throw new Error("Download failed");
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `media-${mediaItem.id}.${isVideo ? 'mp4' : 'jpg'}`;
        a.target = '_blank'; // Open in new tab
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err2) {
        console.error('Download failed:', err2);
        alert('Download failed due to CORS restrictions. Please open the media in a new tab and save manually.');
      }
    }
  };

  const renderMedia = () => {

    if (mediaItem.loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      );
    }

    if (isVideo) {
      return (
        <>
          <Box position="relative" width="100%">
            {videoStatus === VideoStatus.Loading && (
              <Box sx={loadingOverlayStyle}>
                <CircularProgress />
              </Box>
            )}
            <video
              key={videoStatus === VideoStatus.Error ? Date.now() : mediaItem.url}
              ref={videoRef}
              src={mediaItem.url + (videoStatus === VideoStatus.Error ? `?retry=${Date.now()}` : '')}
              onPlay={() => setVideoStatus(VideoStatus.Playing)}
              onPause={() => setVideoStatus(VideoStatus.Paused)}
              onEnded={() => setVideoStatus(VideoStatus.Ended)}
              onLoadedData={() => setVideoStatus(VideoStatus.Paused)}
              onError={() => {
                setVideoStatus(VideoStatus.Error);
                setVideoError('Video failed to load.');
              }}
              playsInline
              controls={false}
              style={{ width: '100%', maxHeight: '70vh', backgroundColor: 'black' }}
            />
            {videoError && (
              <Typography color="error" textAlign="center" p={1}>
                {videoError}
              </Typography>
            )}
          </Box>
        </>
      );
    } else {
      return (
        <img
          src={mediaItem.url}
          alt="Media"
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          onClick={() => setFullscreenOpen(true)}
        />
      );
    }
  };

  const renderActions = () => {
    if (!showActions) return null;

    return (
      <Box sx={actionBarStyle}>
        <Box sx={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
          {isVideo ? (
            <Tooltip title={videoStatus === VideoStatus.Playing ? 'Pause' : 'Play'}>
              <IconButton onClick={handlePlayPause} sx={iconStyle} size="large">
                {videoStatus === VideoStatus.Playing ? <PauseIcon fontSize="inherit" /> : <PlayArrowIcon fontSize="inherit" />}
              </IconButton>
            </Tooltip>
          ) : (
            <>
              <Tooltip title="Transform">
                <IconButton onClick={() => setTransformOpen(true)} sx={iconStyle} size="large">
                  <AutoFixHighIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Animate">
                <IconButton onClick={() => setAnimateOpen(true)} sx={iconStyle} size="large">
                  <AnimationIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </>
          )}

          <Tooltip title="Download">
            <IconButton onClick={handleDownload} sx={iconStyle} size="large">
              <DownloadIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => onDelete(mediaItem)} sx={deleteIconStyle} size="large">
              <DeleteIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    );
  };

  return (
    <>
      <Card
        sx={{
          height: '100vh',
          width: '100vw',
          position: 'absolute',
          top: 0,
          left: 0,
          backgroundColor: 'black',
          display: 'flex',
          flexDirection: 'column',
          transform: isTopCard ? `translateX(${swipeOffset}px) rotate(${swipeOffset / 20}deg)` : 'none',
          transition: touchStart ? 'none' : 'transform 0.2s',
          overflow: 'visible',
          pb: '25vh',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        elevation={isTopCard ? 8 : 2}
      >
        <Box sx={{ flex: '1 1 100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {renderMedia()}
        </Box>

        {mediaItem.prompt && (
          <Box sx={{ px: 2, py: 1, backgroundColor: 'rgba(0,0,0,0.7)', textAlign: 'center' }}>
            <Typography variant="body2" noWrap title={mediaItem.prompt} sx={{ color: '#fff' }}>
              {mediaItem.prompt}
            </Typography>
          </Box>
        )}

        {renderActions()}
      </Card>

      {/* Fullscreen for photos */}
      {!isVideo && (
        <Dialog fullScreen open={fullscreenOpen} onClose={() => setFullscreenOpen(false)}>
          <Box sx={{ backgroundColor: 'black', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <img src={mediaItem.url} alt="Fullscreen" style={{ maxWidth: '100%', maxHeight: '100%' }} />
          </Box>
        </Dialog>
      )}

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
    </>
  );
};

// Styles
const iconStyle = { color: '#fff' };
const deleteIconStyle = { color: 'red' };
const actionBarStyle = {
  width: '100%',
  height: '25%',
  background: 'linear-gradient(to top, rgba(0,0,0,0.98), rgba(0,0,0,0.5))',
  borderTop: '1px solid rgba(255,255,255,0.1)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  py: 1,
  zIndex: 10,
};
const loadingOverlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0,0,0,0.3)',
  zIndex: 2,
};

export default MediaItemComponent;
