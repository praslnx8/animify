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
import React from "react";
import { MediaItem } from "../models/MediaItem";

export interface VideoItemProps {
  mediaItem: MediaItem
  onDelete: (mediaItem: MediaItem) => void;
}

const VideoItemComponent: React.FC<VideoItemProps> = ({ mediaItem, onDelete }) => {
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'playing' | 'error'>('idle');
  const [error, setError] = React.useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handlePlay = () => {
    setError(null);
    setStatus('loading');
  };

  const handleVideoError = () => {
    setStatus('error');
    setError("Video is not available yet. Please try again.");
  };

  const handleVideoLoaded = () => {
    setStatus('playing');
    videoRef.current?.play();
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
          image={mediaItem.base64}
          alt="Video thumbnail"
          sx={{
            objectFit: 'contain',
            display: status === 'playing' ? 'none' : 'block',
            backgroundColor: '#f0f0f0'
          }}
        />

        {status !== 'playing' && (
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

        {status === 'loading' && (
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

        {status !== 'idle' && status !== 'error' && (
          <video
            ref={videoRef}
            width="100%"
            height={160}
            controls
            style={{
              display: status === 'playing' ? 'block' : 'none',
              width: '100%'
            }}
            src={mediaItem.videoUrl}
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
