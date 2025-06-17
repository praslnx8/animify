import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {
  Box,
  Button,
  Card,
  CardMedia,
  CircularProgress,
  IconButton,
  Typography
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { MediaItem } from "../models/MediaItem";

enum VideoStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  PLAYING = 'playing',
  PAUSED = 'paused',
  ENDED = 'ended',
  ERROR = 'error'
}

export interface VideoItemProps {
  mediaItem: MediaItem;
  onDelete: (mediaItem: MediaItem) => void;
}

const VideoItemComponent: React.FC<VideoItemProps> = ({ mediaItem, onDelete }) => {
  const [status, setStatus] = useState<VideoStatus>(VideoStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setStatus(VideoStatus.IDLE);
    setError(null);
  }, [mediaItem.id]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (status === VideoStatus.PLAYING) {
      video.pause();
      setStatus(VideoStatus.PAUSED);
    } else {
      video.play().then(() => setStatus(VideoStatus.PLAYING)).catch(() => setError("Can't play video"));
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(mediaItem.url!);
      if (!response.ok) throw new Error("Failed to fetch video for download");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `video-${mediaItem.id}.mp4`;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      // Optionally show a user-friendly toast or silent fail
    }
  };

  const handleError = () => {
    setStatus(VideoStatus.ERROR);
    setError("Video failed to load.");
  };

  return (
    <Card sx={{ position: "relative", borderRadius: 2, overflow: "hidden", width: "100%" }}>
      {mediaItem.url ? (
        <Box position="relative">
          {status === VideoStatus.LOADING && (
            <Box
              sx={{
                position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                display: "flex", alignItems: "center", justifyContent: "center",
                backgroundColor: "rgba(0,0,0,0.3)", zIndex: 1
              }}
            >
              <CircularProgress />
            </Box>
          )}
          <video
            ref={videoRef}
            src={mediaItem.url}
            onPlay={() => setStatus(VideoStatus.PLAYING)}
            onPause={() => setStatus(VideoStatus.PAUSED)}
            onEnded={() => setStatus(VideoStatus.ENDED)}
            onLoadedData={() => setStatus(VideoStatus.PAUSED)}
            onError={handleError}
            playsInline
            controls={false}
            style={{ width: "100%", backgroundColor: "black" }}
          />
          <Box display="flex" justifyContent="space-around" p={1} bgcolor="rgba(0,0,0,0.5)">
            <IconButton onClick={handlePlayPause} sx={{ color: "white" }}>
              {status === VideoStatus.PLAYING ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
            <IconButton onClick={handleDownload} sx={{ color: "white" }}>
              <DownloadIcon />
            </IconButton>
            <IconButton onClick={() => onDelete(mediaItem)} sx={{ color: "white" }}>
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      ) : (
        <Box position="relative">
          <CardMedia
            component="img"
            image={mediaItem.parent?.url}
            alt="Thumbnail"
            sx={{ width: "100%", height: 200, objectFit: "cover" }}
          />
          <Box position="absolute" top={0} left={0} width="100%" height="100%" bgcolor="rgba(0,0,0,0.4)" display="flex" alignItems="center" justifyContent="center">
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={() => setStatus(VideoStatus.LOADING)}
            >
              Play
            </Button>
          </Box>
        </Box>
      )}
      {error && (
        <Typography color="error" p={1} textAlign="center">
          {error}
        </Typography>
      )}
    </Card>
  );
};

export default VideoItemComponent;
