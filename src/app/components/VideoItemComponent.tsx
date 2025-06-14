'use client';


import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteIcon from '@mui/icons-material/Delete';
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
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    setError(null);
    setIsLoading(true);
    setIsPlaying(true);
  };

  const handleVideoError = () => {
    setIsLoading(false);
    setIsPlaying(false);
    setError("Video is not available yet. Please try again.");
  };

  const handleVideoLoaded = () => {
    setIsLoading(false);
    videoRef.current?.play();
  };

  return (
    <Card sx={{ mb: 2, position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 3 }}>
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={() => onDelete(mediaItem)}
          sx={{ minWidth: 0, p: 1, borderRadius: '50%' }}
          aria-label="Delete video"
        >
          <DeleteIcon />
        </Button>
      </Box>
      {!isPlaying && (
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="160"
            image={mediaItem.imageUrl}
            alt="Video thumbnail"
          />
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
              sx={{ borderRadius: '50%', minWidth: 56, minHeight: 56, p: 0 }}
              aria-label="Play video"
            >
              <PlayArrowIcon fontSize="large" />
            </Button>
          </Box>
        </Box>
      )}
      {isPlaying && (
        <Box sx={{ position: 'relative' }}>
          {isLoading && (
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
          <video
            ref={videoRef}
            width="100%"
            height="160"
            controls
            style={{ display: isLoading ? 'none' : 'block' }}
            src={mediaItem.videoUrl}
            onLoadedData={handleVideoLoaded}
            onError={handleVideoError}
          />
        </Box>
      )}
      {error && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="error" variant="body2">{error}</Typography>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<PlayArrowIcon />}
            onClick={handlePlay}
            sx={{ mt: 1 }}
          >
            Retry
          </Button>
        </Box>
      )}
    </Card>
  );
};

export default VideoItemComponent;
