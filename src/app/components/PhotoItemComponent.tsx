'use client';

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
        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 3 }}>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => onDelete(mediaItem)}
            sx={{ minWidth: 0, p: 1, borderRadius: '50%' }}
            aria-label="Delete photo"
          >
            <DeleteIcon />
          </Button>
        </Box>
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
              justifyContent: 'center',
              padding: '8px',
              background: 'rgba(0,0,0,0.3)'
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => setDialogOpen(true)}
              sx={{ borderRadius: '50%', minWidth: 48, minHeight: 48, p: 0, mx: 1 }}
              aria-label="Transform photo"
            >
              <AutoFixHighIcon />
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setAnimateDialogOpen(true)}
              sx={{ borderRadius: '50%', minWidth: 48, minHeight: 48, p: 0, mx: 1 }}
              aria-label="Animate photo"
            >
              <AnimationIcon />
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
