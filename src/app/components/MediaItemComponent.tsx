'use client';

import {
  Animation as AnimationIcon,
  AutoFixHigh as AutoFixHighIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
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

  const isVideo = mediaItem.type === MediaType.Video;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoKey, setVideoKey] = React.useState<number>(0);
  const [videoStatus, setVideoStatus] = useState<VideoStatus>(VideoStatus.Idle);
  const [videoError, setVideoError] = useState<string | null>(null);

  useEffect(() => {
    setVideoStatus(VideoStatus.Idle);
    setVideoError(null);
  }, [mediaItem.id]);

  const handlePlay = () => {
    setVideoError(null);
    setVideoStatus(VideoStatus.Loading);
    setVideoKey(prevKey => prevKey + 1);
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
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
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
            }}
          >
            {videoStatus !== VideoStatus.Idle && (

              <video
                key={videoKey}
                ref={videoRef}
                width="100%"
                height={160}
                controls
                style={{
                  display: videoStatus === VideoStatus.Playing ? 'block' : 'none',
                  width: '100%'
                }}
                src={getVideoUrlWithCacheBuster()}
                onLoadedData={handleVideoLoaded}
                onError={(e) => {
                  console.error('Video error event:', e);
                  setVideoStatus(VideoStatus.Error);
                  setVideoError('Video failed to load. Try playing again later.');
                }}
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
      <img
        src={mediaItem.url}
        alt="Media"
        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
      />
    );
  };

  const renderActions = () => {
    const showRetry = mediaItem.parent && mediaItem.prompt;
    const showDownload = mediaItem.type === MediaType.Video;
    return (
      <Box display="flex" justifyContent="space-around" alignItems="center" width="100%">
        {mediaItem.type === MediaType.Video && (
          <Tooltip title='Play'>
            <IconButton onClick={handlePlay} color="primary" size="large" disabled={videoStatus === VideoStatus.Playing}>
              <PlayArrowIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        )}
        {mediaItem.type === MediaType.Image && (
          <>
            <Tooltip title="Edit Photo">
              <IconButton onClick={() => setTransformOpen(true)} color="primary" size="large">
                <AutoFixHighIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Animate Photo">
              <IconButton onClick={() => setAnimateOpen(true)} color="secondary" size="large">
                <AnimationIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          </>
        )}
        {showDownload && (
          <Tooltip title="Download">
            <IconButton onClick={handleDownload} color="primary" size="large">
              <DownloadIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        )}
        {showRetry && (
          <Tooltip title="Retry">
            <IconButton onClick={handleRetry} color="primary" size="large">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V2L7 7l5 5V8c3.31 0 6 2.69 6 6 0 1.3-.42 2.5-1.13 3.47l1.46 1.46C19.07 17.07 20 15.15 20 13c0-4.42-3.58-8-8-8zm-6.87 3.13l-1.46 1.46C4.93 6.93 6.85 6 9 6c4.42 0 8 3.58 8 8 0 1.3-.42 2.5-1.13 3.47l1.46 1.46C19.07 17.07 20 15.15 20 13c0-4.42-3.58-8-8-8-2.15 0-4.07.93-5.47 2.13z" fill="#1976d2" />
              </svg>
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Delete">
          <IconButton onClick={() => onDelete(mediaItem)} color="error" size="large">
            <DeleteIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
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
        <Box flex={3} width="100%" display="flex" flexDirection="column" overflow="hidden">
          <Box flex={1} display="flex" justifyContent="center" alignItems="center" overflow="hidden" width="100%">
            {renderMedia()}
          </Box>
          {mediaItem.prompt && (
            <Box px={2} py={1} bgcolor="rgba(0,0,0,0.7)" textAlign="center">
              <Typography variant="body2" noWrap title={mediaItem.prompt} color="#fff">
                {mediaItem.prompt}
              </Typography>
            </Box>
          )}
        </Box>
        <Box flex={1} width="100%" display="flex" alignItems="center" justifyContent="center" borderTop={1} borderColor="divider" bgcolor="background.default">
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
