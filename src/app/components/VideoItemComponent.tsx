import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReplayIcon from '@mui/icons-material/Replay';
import {
  Box,
  Button,
  Card,
  CardMedia,
  CircularProgress,
  Dialog,
  Fade,
  IconButton,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery,
  useTheme
} from "@mui/material";
import React, { useEffect, useState } from "react";
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
  const [status, setStatus] = React.useState<VideoStatus>(VideoStatus.IDLE);
  const [error, setError] = React.useState<string | null>(null);
  const [videoKey, setVideoKey] = React.useState<number>(0);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const fullscreenVideoRef = React.useRef<HTMLVideoElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    setStatus(VideoStatus.IDLE);
    setError(null);
  }, [mediaItem.id]);

  const handlePlay = () => {
    setError(null);
    if (status === VideoStatus.PAUSED && videoRef.current) {
      videoRef.current.play();
      setStatus(VideoStatus.PLAYING);
    } else {
      setStatus(VideoStatus.LOADING);
      setVideoKey(prevKey => prevKey + 1);
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setStatus(VideoStatus.PAUSED);
    }
  };

  const handleVideoError = () => {
    setStatus(VideoStatus.ERROR);
    setError("Video is not available yet. Please try again.");
  };

  const handleVideoLoaded = () => {
    if (videoRef.current) {
      setStatus(VideoStatus.PLAYING);
      videoRef.current.play().catch(() => {
        setStatus(VideoStatus.IDLE);
      });
    }
  };

  const handleVideoEnded = () => {
    setStatus(VideoStatus.ENDED);
  };

  const handleDownload = () => {
    if (mediaItem.url) {
      // Create an anchor element and use it to download the video
      const a = document.createElement('a');
      a.href = mediaItem.url;
      a.download = `video-${mediaItem.id}.mp4`; // Default filename
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleCardHover = () => {
    if (!isMobile) {
      setControlsVisible(true);
    }
  };

  const handleCardLeave = () => {
    if (!isMobile) {
      setControlsVisible(false);
    }
  };

  const handleCardTouch = () => {
    if (isMobile) {
      setControlsVisible(!controlsVisible);
    }
  };

  useEffect(() => {
    // Sync fullscreen video with main video
    if (fullscreenOpen && fullscreenVideoRef.current && videoRef.current) {
      fullscreenVideoRef.current.currentTime = videoRef.current.currentTime;
      if (status === VideoStatus.PLAYING) {
        fullscreenVideoRef.current.play();
      }
    }
  }, [fullscreenOpen, status]);

  const hasVideoUrl = !!mediaItem.url;
  const thumbnailImage = mediaItem.parent?.url;

  const renderVideoControls = () => (
    <Fade in={controlsVisible || status === VideoStatus.IDLE || status === VideoStatus.ENDED || status === VideoStatus.ERROR || !hasVideoUrl}>
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: status === VideoStatus.IDLE || status === VideoStatus.ENDED || status === VideoStatus.ERROR
            ? 'rgba(0,0,0,0.4)'
            : 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 30%, rgba(0,0,0,0) 100%)',
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (status === VideoStatus.IDLE || status === VideoStatus.ENDED) {
            handlePlay();
          } else if (status === VideoStatus.PLAYING) {
            handlePause();
          } else if (status === VideoStatus.PAUSED) {
            handlePlay();
          }
        }}
      >
        {/* Center play/pause button */}
        {(status === VideoStatus.IDLE || status === VideoStatus.ENDED || status === VideoStatus.ERROR) && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <IconButton
              sx={{
                backgroundColor: alpha(theme.palette.common.white, 0.15),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.white, 0.3),
                },
                color: 'white',
                p: 2
              }}
            >
              {status === VideoStatus.ENDED ? <ReplayIcon fontSize="large" /> : <PlayArrowIcon fontSize="large" />}
            </IconButton>
          </Box>
        )}

        {/* Bottom control bar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px',
            width: '100%'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Play/Pause buttons */}
          <Box>
            {status === VideoStatus.PLAYING ? (
              <Tooltip title="Pause">
                <IconButton
                  color="primary"
                  onClick={handlePause}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.background.paper, 0.7),
                    },
                  }}
                >
                  <PauseIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title={status === VideoStatus.ENDED ? "Replay" : "Play"}>
                <IconButton
                  color="primary"
                  onClick={handlePlay}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.background.paper, 0.7),
                    },
                  }}
                >
                  {status === VideoStatus.ENDED ? <ReplayIcon /> : <PlayArrowIcon />}
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* Fullscreen button */}
            <Tooltip title="View fullscreen">
              <IconButton
                size={isMobile ? "small" : "medium"}
                onClick={(e) => {
                  e.stopPropagation();
                  setFullscreenOpen(true);
                }}
                sx={{
                  bgcolor: alpha(theme.palette.background.paper, 0.5),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.background.paper, 0.7),
                  },
                  color: theme.palette.primary.main
                }}
              >
                <FullscreenIcon />
              </IconButton>
            </Tooltip>

            {/* Download button */}
            {hasVideoUrl && (
              <Tooltip title="Download video">
                <IconButton
                  size={isMobile ? "small" : "medium"}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload();
                  }}
                  sx={{
                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.background.paper, 0.7),
                    },
                    color: theme.palette.primary.main
                  }}
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            )}

            {/* Delete button */}
            <Tooltip title="Delete video">
              <IconButton
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(mediaItem);
                }}
                size={isMobile ? "small" : "medium"}
                sx={{
                  bgcolor: alpha(theme.palette.background.paper, 0.5),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.background.paper, 0.7),
                  },
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Fade>
  );

  return (
    <>
      <Card
        ref={containerRef}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2,
          boxShadow: 2,
          flex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
        onMouseEnter={handleCardHover}
        onMouseLeave={handleCardLeave}
        onClick={handleCardTouch}
      >
        {status === VideoStatus.LOADING && (
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
              backgroundColor: 'rgba(0,0,0,0.2)',
              zIndex: 10
            }}
          >
            <CircularProgress color="primary" />
          </Box>
        )}

        {hasVideoUrl ? (
          <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
            <video
              ref={videoRef}
              key={videoKey}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                backgroundColor: theme.palette.common.black,
                display: 'block'
              }}
              onLoadedData={handleVideoLoaded}
              onError={handleVideoError}
              onEnded={handleVideoEnded}
              src={mediaItem.url}
              playsInline
            />
            {renderVideoControls()}
          </Box>
        ) : (
          // Show thumbnail with play overlay when video is not available
          <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
            <CardMedia
              component="img"
              image={thumbnailImage}
              alt="Video thumbnail"
              sx={{
                backgroundColor: theme.palette.common.black,
                objectFit: 'contain',
                width: '100%',
                height: '100%'
              }}
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
                backgroundColor: 'rgba(0,0,0,0.2)',
              }}
            >
              {error ? (
                <Typography
                  variant="body1"
                  color="error"
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    backgroundColor: alpha(theme.palette.background.paper, 0.7),
                    borderRadius: 1
                  }}
                >
                  {error}
                </Typography>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handlePlay}
                  startIcon={<PlayArrowIcon />}
                  sx={{ borderRadius: 8 }}
                >
                  {status === VideoStatus.LOADING ? "Loading..." : "Play Video"}
                </Button>
              )}
            </Box>

            {/* Delete button for thumbnail view */}
            <Box sx={{ position: 'absolute', bottom: 8, right: 8 }}>
              <Button
                variant="contained"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(mediaItem);
                }}
                sx={{
                  borderRadius: '50%',
                  minWidth: { xs: 40, sm: 48 },
                  minHeight: { xs: 40, sm: 48 },
                  p: 0
                }}
              >
                <DeleteIcon fontSize="small" />
              </Button>
            </Box>
          </Box>
        )}
      </Card>

      {/* Fullscreen video dialog */}
      <Dialog
        open={fullscreenOpen}
        onClose={() => setFullscreenOpen(false)}
        maxWidth="xl"
        fullScreen={isMobile}
      >
        <Box sx={{
          backgroundColor: 'black',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          position: 'relative'
        }}>
          {hasVideoUrl && (
            <video
              ref={fullscreenVideoRef}
              controls
              style={{
                maxHeight: '100%',
                maxWidth: '100%',
                width: '100%',
                height: 'auto'
              }}
              src={mediaItem.url}
              playsInline
              autoPlay
            />
          )}
          <IconButton
            onClick={() => setFullscreenOpen(false)}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              backgroundColor: alpha(theme.palette.common.black, 0.5),
              color: theme.palette.common.white,
              '&:hover': {
                backgroundColor: alpha(theme.palette.common.black, 0.7),
              }
            }}
          >
            <CloseIcon />
          </IconButton>

          {hasVideoUrl && (
            <IconButton
              onClick={handleDownload}
              sx={{
                position: 'absolute',
                top: 16,
                right: 70,
                backgroundColor: alpha(theme.palette.common.black, 0.5),
                color: theme.palette.common.white,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.black, 0.7),
                }
              }}
            >
              <DownloadIcon />
            </IconButton>
          )}
        </Box>
      </Dialog>
    </>
  );
};

export default VideoItemComponent;
