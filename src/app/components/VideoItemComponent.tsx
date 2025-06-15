import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {
  Box,
  Button,
  Card,
  CardMedia,
  CircularProgress,
  Typography
} from "@mui/material";
import React, { useEffect } from "react";
import { MediaItem } from "../models/MediaItem";
import { base64ToDataUrl } from '../utils/base64-utils';

enum VideoStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  PLAYING = 'playing',
  ERROR = 'error'
}

export interface VideoItemProps {
  mediaItem: MediaItem
  onDelete: (mediaItem: MediaItem) => void;
}

const VideoItemComponent: React.FC<VideoItemProps> = ({ mediaItem, onDelete }) => {
  const [status, setStatus] = React.useState<VideoStatus>(VideoStatus.IDLE);
  const [error, setError] = React.useState<string | null>(null);
  const [videoKey, setVideoKey] = React.useState<number>(0); // Add a key to force remounting the video element
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStatus(VideoStatus.IDLE);
    setError(null);
  }, [mediaItem.id]);

  const handlePlay = () => {
    setError(null);
    setStatus(VideoStatus.LOADING);
    setVideoKey(prevKey => prevKey + 1);
  };

  const handleVideoError = () => {
    setStatus(VideoStatus.ERROR);
    setError("Video is not available yet. Please try again.");
  };

  const handleVideoLoaded = () => {
    setStatus(VideoStatus.PLAYING);
    videoRef.current?.play();
  };

  const getVideoUrlWithCacheBuster = () => {
    if (!mediaItem.videoUrl) return '';

    const separator = mediaItem.videoUrl.includes('?') ? '&' : '?';
    return `${mediaItem.videoUrl}${separator}t=${Date.now()}`;
  };

  return (
    <Card sx={{ mb: 2, position: 'relative', overflow: 'hidden' }} ref={containerRef}>
      <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 3 }}>
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={() => onDelete(mediaItem)}
          sx={{
            minWidth: 0,
            p: { xs: 0.5, sm: 1 },
            borderRadius: '50%',
            width: { xs: '32px', sm: '40px' },
            height: { xs: '32px', sm: '40px' }
          }}
          aria-label="Delete video"
        >
          <DeleteIcon fontSize={typeof window !== 'undefined' && window.innerWidth < 600 ? "small" : "medium"} />
        </Button>
      </Box>
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="160"
          image={base64ToDataUrl(mediaItem.base64!)}
          alt="Video thumbnail"
          sx={{
            objectFit: 'contain',
            display: status === VideoStatus.PLAYING ? 'none' : 'block',
            backgroundColor: '#f0f0f0'
          }}
        />

        {status !== VideoStatus.PLAYING && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.3)'
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handlePlay}
              sx={{
                borderRadius: '50%',
                minWidth: { xs: 40, sm: 48 },
                minHeight: { xs: 40, sm: 48 },
                p: 0
              }}
              aria-label={error ? "Retry video" : "Play video"}
            >
              <PlayArrowIcon fontSize={typeof window !== 'undefined' && window.innerWidth < 600 ? "medium" : "large"} />
            </Button>
          </Box>
        )}

        {status === VideoStatus.LOADING && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            background: 'rgba(0,0,0,0.3)'
          }}>
            <CircularProgress color="primary" />
          </Box>
        )}

        {status !== VideoStatus.IDLE && (
          <video
            key={videoKey} // Key prop forces remounting when changed
            ref={videoRef}
            width="100%"
            height={160}
            controls
            style={{
              display: status === VideoStatus.PLAYING ? 'block' : 'none',
              width: '100%'
            }}
            src={getVideoUrlWithCacheBuster()}
            onLoadedData={handleVideoLoaded}
            onError={handleVideoError}
          />
        )}
      </Box>
      {error && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="error" variant="body2">{error}</Typography>
        </Box>
      )}
    </Card>
  );
};

export default VideoItemComponent;
