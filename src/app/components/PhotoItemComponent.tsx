import AnimationIcon from "@mui/icons-material/Animation";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import DeleteIcon from "@mui/icons-material/Delete";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import {
  Box,
  Button,
  Card,
  CardMedia,
  Dialog,
  Fade,
  IconButton,
  Tooltip,
  alpha,
  useMediaQuery,
  useTheme
} from "@mui/material";
import React, { useState } from "react";
import { MediaItem } from "../models/MediaItem";
import { base64ToDataUrl } from "../utils/base64-utils";
import PhotoAnimateDialog from "./PhotoAnimateDialog";
import PhotoTransformDialog from "./PhotoTransformDialog";

export interface PhotoItemProps {
  mediaItem: MediaItem
  addMediaItem: (mediaItem: MediaItem) => void;
  updateMediaItem: (mediaItem: MediaItem) => void;
  onDelete: (mediaItem: MediaItem) => void;
}

const PhotoItemComponent: React.FC<PhotoItemProps> = ({ mediaItem, addMediaItem, updateMediaItem, onDelete }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [animateDialogOpen, setAnimateDialogOpen] = useState(false);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const imageUrl = mediaItem.base64 ? base64ToDataUrl(mediaItem.base64) : undefined;

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

  return (
    <>
      <Card
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2,
          boxShadow: 2,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: { xs: 'calc(70vh - 56px)', sm: 'calc(70vh - 64px)' }, // Adjust for prompt height if needed
          maxHeight: { xs: '600px', sm: '700px' },
          '&:hover': {
            boxShadow: 4,
          },
          transition: 'box-shadow 0.3s ease'
        }}
        onMouseEnter={handleCardHover}
        onMouseLeave={handleCardLeave}
        onClick={handleCardTouch}
      >
        <Box sx={{ position: 'relative', flex: 1, display: 'flex' }}>
          <CardMedia
            component="img"
            image={imageUrl}
            alt="Photo"
            sx={{
              backgroundColor: alpha(theme.palette.common.black, 0.04),
              objectFit: 'contain',
              width: '100%',
              height: '100%'
            }}
          />

          {/* Fullscreen button - always visible */}
          <Tooltip title="View fullscreen">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setFullscreenOpen(true);
              }}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: alpha(theme.palette.background.paper, 0.7),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.background.paper, 0.9),
                }
              }}
            >
              <FullscreenIcon />
            </IconButton>
          </Tooltip>

          <Fade in={controlsVisible || !isMobile}>
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                background: isMobile
                  ? 'rgba(0,0,0,0.5)'
                  : 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                transition: 'opacity 0.3s ease'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Tooltip title="Transform photo">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setDialogOpen(true)}
                    sx={{
                      borderRadius: '50%',
                      minWidth: { xs: 40, sm: 48 },
                      minHeight: { xs: 40, sm: 48 },
                      p: 0,
                      mx: 1
                    }}
                    aria-label="Transform photo"
                  >
                    <AutoFixHighIcon fontSize={isMobile ? "small" : "medium"} />
                  </Button>
                </Tooltip>
                <Tooltip title="Animate photo">
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => setAnimateDialogOpen(true)}
                    sx={{
                      borderRadius: '50%',
                      minWidth: { xs: 40, sm: 48 },
                      minHeight: { xs: 40, sm: 48 },
                      p: 0,
                      mx: 1
                    }}
                    aria-label="Animate photo"
                  >
                    <AnimationIcon fontSize={isMobile ? "small" : "medium"} />
                  </Button>
                </Tooltip>
              </Box>

              <Tooltip title="Delete photo">
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => onDelete(mediaItem)}
                  sx={{
                    borderRadius: '50%',
                    minWidth: { xs: 40, sm: 48 },
                    minHeight: { xs: 40, sm: 48 },
                    p: 0
                  }}
                  aria-label="Delete photo"
                >
                  <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
                </Button>
              </Tooltip>
            </Box>
          </Fade>
        </Box>
      </Card>

      {/* Fullscreen image dialog */}
      <Dialog
        open={fullscreenOpen}
        onClose={() => setFullscreenOpen(false)}
        maxWidth="xl"
        fullScreen={isMobile}
        onClick={() => setFullscreenOpen(false)}
      >
        <Box sx={{
          backgroundColor: 'black',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'auto'
        }}>
          <img
            src={imageUrl}
            alt="Fullscreen view"
            style={{
              maxHeight: '100%',
              maxWidth: '100%',
              objectFit: 'contain'
            }}
          />
        </Box>
      </Dialog>

      <PhotoTransformDialog
        open={dialogOpen}
        base64={mediaItem.base64!!}
        onClose={() => setDialogOpen(false)}
        addMediaItem={(mediaItem) => {
          setDialogOpen(false);
          addMediaItem(mediaItem);
        }}
        updateMediaItem={(mediaItem) => {
          setDialogOpen(false);
          updateMediaItem(mediaItem);
        }}
      />
      <PhotoAnimateDialog
        open={animateDialogOpen}
        mediaItem={mediaItem}
        onClose={() => setAnimateDialogOpen(false)}
        addMediaItem={(mediaItem) => {
          setAnimateDialogOpen(false);
          addMediaItem(mediaItem);
        }}
        updateMediaItem={(mediaItem) => {
          setAnimateDialogOpen(false);
          updateMediaItem(mediaItem);
        }}
      />
    </>
  );
};

export default PhotoItemComponent;
