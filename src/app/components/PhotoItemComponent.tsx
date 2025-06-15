import AnimationIcon from "@mui/icons-material/Animation";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  Card,
  CardMedia,
  alpha,
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
  const theme = useTheme();

  return (
    <>
      <Card sx={{ mb: 2, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="160"
            image={mediaItem.base64 ? base64ToDataUrl(mediaItem.base64) : undefined}
            alt="Photo"
            sx={{
              backgroundColor: alpha(theme.palette.common.black, 0.04),
              objectFit: 'contain'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px',
              background: 'rgba(0,0,0,0.3)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
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
                <AutoFixHighIcon fontSize={typeof window !== 'undefined' && window.innerWidth < 600 ? "small" : "medium"} />
              </Button>
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
                <AnimationIcon fontSize={typeof window !== 'undefined' && window.innerWidth < 600 ? "small" : "medium"} />
              </Button>
            </Box>

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
              <DeleteIcon fontSize={typeof window !== 'undefined' && window.innerWidth < 600 ? "small" : "medium"} />
            </Button>
          </Box>
        </Box>
      </Card>
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
