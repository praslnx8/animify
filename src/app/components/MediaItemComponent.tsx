'use client';

import React from "react";
import { MediaItem } from "../models/MediaItem";
import PhotoItemComponent from "./PhotoItemComponent";
import VideoItemComponent from "./VideoItemComponent";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export interface MediaItemProps {
  mediaItem: MediaItem,
  addMediaItem: (mediaItem: MediaItem) => void;
  updateMediaItem: (mediaItem: MediaItem) => void;
}

const MediaItemComponent: React.FC<MediaItemProps> = ({ mediaItem, addMediaItem, updateMediaItem }) => {
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
      {mediaItem.type === "image" ? (
        <PhotoItemComponent mediaItem={mediaItem} addMediaItem={addMediaItem} updateMediaItem={updateMediaItem} />
      ) : (
        <VideoItemComponent mediaItem={mediaItem} />
      )}
    </>
  );
};

export default MediaItemComponent;
