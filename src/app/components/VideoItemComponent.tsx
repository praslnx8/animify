'use client';


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
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [videoHeight, setVideoHeight] = React.useState<number>(160);
  const [videoWidth, setVideoWidth] = React.useState<number | string>("100%");
  const [videoFetched, setVideoFetched] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handlePlay = () => {
    setError(null);
    setIsLoading(true);
    setIsPlaying(true);
    setVideoFetched(true);
  };

  const handleVideoError = () => {
    setIsLoading(false);
    setIsPlaying(false);
    setError("Video is not available yet. Please try again.");
  };

  const handleVideoLoaded = () => {
    setIsLoading(false);

    if (videoRef.current) {
      const video = videoRef.current;

      const containerWidth = containerRef.current?.clientWidth || video.clientWidth;

      const aspectRatio = video.videoWidth / video.videoHeight;
      const calculatedHeight = containerWidth / aspectRatio;

      setVideoHeight(calculatedHeight);
      setVideoWidth(containerWidth);

      video.play();
    }
  };

  return (
    <Card sx={{ mb: 2, position: 'relative', overflow: 'hidden' }} ref={containerRef}>
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
      <Box sx={{ position: 'relative' }}>
        {/* Always show the thumbnail until the video is loaded */}
        <CardMedia
          component="img"
          height="160"
          image={mediaItem.base64 || mediaItem.imageUrl}
          alt="Video thumbnail"
          sx={{
            objectFit: 'contain',
            display: isPlaying && !isLoading ? 'none' : 'block'
          }}
        />

        {/* Play button overlay */}
        {!isPlaying && (
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
              sx={{ borderRadius: '50%', minWidth: 48, minHeight: 48, p: 0 }}
              aria-label="Play video"
            >
              <PlayArrowIcon fontSize="large" />
            </Button>
          </Box>
        )}

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

        {videoFetched && (
          <video
            ref={videoRef}
            width={videoWidth}
            height={videoHeight}
            controls
            style={{
              display: isPlaying && !isLoading ? 'block' : 'none',
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
