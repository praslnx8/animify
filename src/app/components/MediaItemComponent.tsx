'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
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
      <Box color="error.main" textAlign="center" py={2}>
        {mediaItem.error}
      </Box>
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
    <>
      {mediaItem.type === MediaType.Image ? (
        <PhotoItemComponent mediaItem={mediaItem} addMediaItem={addMediaItem} updateMediaItem={updateMediaItem} onDelete={onDelete} />
      ) : (
        <VideoItemComponent mediaItem={mediaItem} onDelete={onDelete} />
      )}
    </>
  );
};

export default MediaItemComponent;
