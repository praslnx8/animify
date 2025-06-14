'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import React from "react";
import { MediaItem } from "../models/MediaItem";
import { MediaType } from "../models/MediaType";
import PhotoItemComponent from "./PhotoItemComponent";
import VideoItemComponent from "./VideoItemComponent";

export interface MediaItemProps {
  mediaItem: MediaItem,
  addMediaItem: (mediaItem: MediaItem) => void;
  updateMediaItem: (mediaItem: MediaItem) => void;
  onDelete: (mediaItem: MediaItem) => void;
}

const MediaItemComponent: React.FC<MediaItemProps> = ({ mediaItem, addMediaItem, updateMediaItem, onDelete }) => {
  if (mediaItem.error) {
    return (
      <Card sx={{ mb: 2, position: 'relative', overflow: 'hidden', p: 2 }}>
        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 3 }}>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => onDelete(mediaItem)}
            sx={{ minWidth: 0, p: 1, borderRadius: '50%' }}
            aria-label="Delete item"
          >
            <DeleteIcon />
          </Button>
        </Box>
        <Box color="error.main" textAlign="center" py={2}>
          {mediaItem.error}
        </Box>
      </Card>
    );
  }
  if (mediaItem.loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
        <CircularProgress color="primary" />
      </Box>
    );
  }
  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: { xs: '100%', sm: 400 },
      mx: 'auto',
      px: { xs: 1, sm: 0 }
    }}>
      {mediaItem.type === MediaType.Image ? (
        <PhotoItemComponent mediaItem={mediaItem} addMediaItem={addMediaItem} updateMediaItem={updateMediaItem} onDelete={onDelete} />
      ) : (
        <VideoItemComponent mediaItem={mediaItem} onDelete={onDelete} />
      )}
    </Box>
  );
};

export default MediaItemComponent;
