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
  IconButton,
  Tooltip,
  Typography
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

import { downloadMedia } from '../api/downloadMedia';
import { MediaItem } from '../models/MediaItem';
import { MediaType } from '../models/MediaType';
import PhotoAnimateDialog, { silentPhotoAnimate } from './PhotoAnimateDialog';
import PhotoTransformDialog, { silentPhotoTransform } from './PhotoTransformDialog';

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
  const [transformOpen, setTransformOpen] = useState(false);
  const [animateOpen, setAnimateOpen] = useState(false);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const isVideo = mediaItem.type === MediaType.Video;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoStatus, setVideoStatus] = useState<VideoStatus>(VideoStatus.Idle);
  const [videoError, setVideoError] = useState<string | null>(null);

  useEffect(() => {
    setVideoStatus(isVideo ? VideoStatus.Paused : VideoStatus.Idle);
    setVideoError(null);
    if (isVideo && videoRef.current) {
      videoRef.current.pause();
      if (mediaItem.url) {
        videoRef.current.src = mediaItem.url + `?retry=${Date.now()}`;
      }
    }
  }, [mediaItem.id, isVideo, mediaItem.url]);

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
      setVideoError(null);
      setVideoStatus(VideoStatus.Loading);
      if (videoRef.current) {
        videoRef.current.src = mediaItem.url + `?retry=${Date.now()}`;
        videoRef.current.load();
      }
      videoRef.current.play()
        .then(() => setVideoStatus(VideoStatus.Playing))
        .catch((error) => {
          console.error('Video play error:', error);
          setVideoStatus(VideoStatus.Error);
          setVideoError("Can't play video - content may not be ready yet");
        });
    }
  };

  const handleDownload = () => {
    downloadMedia(mediaItem.url!, mediaItem.id, mediaItem.type === MediaType.Video);
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
        <Box position="relative" width="100%" flex={1} display="flex" justifyContent="center" alignItems="center">
          {videoStatus === VideoStatus.Loading && <Box sx={loadingOverlayStyle}><CircularProgress /></Box>}
          {(videoStatus !== VideoStatus.Playing) && (
            <img
              src={mediaItem.parent?.url}
              alt="Media"
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          )}
          <Box
            sx={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              opacity: videoStatus === VideoStatus.Playing ? 1 : 0,
              zIndex: videoStatus === VideoStatus.Playing ? 2 : 0,
              transition: 'opacity 0.3s ease', overflow: 'hidden'
            }}
          >
            <video
              ref={videoRef}
              onPlay={() => setVideoStatus(VideoStatus.Playing)}
              onPause={() => setVideoStatus(VideoStatus.Paused)}
              onEnded={() => setVideoStatus(VideoStatus.Ended)}
              onLoadedData={() => videoStatus === VideoStatus.Loading && setVideoStatus(VideoStatus.Paused)}
              onError={(e) => {
                console.error('Video error event:', e);
                setVideoStatus(VideoStatus.Error);
                setVideoError('Video failed to load. Try playing again later.');
              }}
              playsInline
              controls={false}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', backgroundColor: 'black' }}
            />
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
      <img
        src={mediaItem.url}
        alt="Media"
        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
      />
    );
  };

  const renderActions = () => {
    if (!showActions) return null;
    const showRetry = mediaItem.parent && mediaItem.prompt;
    const showDownload = mediaItem.type === MediaType.Video;
    return (
      <Box sx={actionBarStyle}>
        <Box sx={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
          {mediaItem.type === MediaType.Video && (
            <Tooltip title={videoStatus === VideoStatus.Playing ? 'Pause' : 'Play'}>
              <IconButton onClick={handlePlayPause} sx={iconStyle} size="large">
                {videoStatus === VideoStatus.Playing ? <PauseIcon fontSize="inherit" /> : <PlayArrowIcon fontSize="inherit" />}
              </IconButton>
            </Tooltip>
          )}
          {mediaItem.type === MediaType.Image && (
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
          {showDownload && (
            <Tooltip title="Download">
              <IconButton onClick={handleDownload} sx={iconStyle} size="large">
                <DownloadIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          )}
          {showRetry && (
            <Tooltip title="Retry">
              <IconButton onClick={handleRetry} sx={iconStyle} size="large">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V2L7 7l5 5V8c3.31 0 6 2.69 6 6 0 1.3-.42 2.5-1.13 3.47l1.46 1.46C19.07 17.07 20 15.15 20 13c0-4.42-3.58-8-8-8zm-6.87 3.13l-1.46 1.46C4.93 6.93 6.85 6 9 6c4.42 0 8 3.58 8 8 0 1.3-.42 2.5-1.13 3.47l1.46 1.46C19.07 17.07 20 15.15 20 13c0-4.42-3.58-8-8-8-2.15 0-4.07.93-5.47 2.13z" fill="#fff" />
                </svg>
              </IconButton>
            </Tooltip>
          )}
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
          minHeight: 0,
          minWidth: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'black',
          display: 'flex',
          flexDirection: 'column',
          transform: isTopCard ? `translateX(${swipeOffset}px) rotate(${swipeOffset / 20}deg)` : 'none',
          transition: touchStart ? 'none' : 'transform 0.2s',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        elevation={isTopCard ? 8 : 2}
      >
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
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
        </Box>
      </Card>

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
  background: 'linear-gradient(to top, rgba(0,0,0,0.98), rgba(0,0,0,0.5))',
  borderTop: '1px solid rgba(255,255,255,0.1)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '0.75rem 1rem 1rem',
  position: 'relative',
  zIndex: 10,
  boxSizing: 'border-box',
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
