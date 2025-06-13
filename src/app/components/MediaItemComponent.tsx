'use client';

import React from "react";
import { MediaItem } from "../models/MediaItem";
import PhotoItemComponent from "./PhotoItemComponent";

export interface MediaItemProps {
  mediaItem: MediaItem,
  onTransform: (newBase64: string) => void;
  onAnimate: (videoUrl: string) => void;
}

const MediaItemComponent: React.FC<MediaItemProps> = ({ mediaItem, onTransform, onAnimate }) => {

  return (
    <>
      {mediaItem.type === "image" ? (
        <PhotoItemComponent mediaItem={mediaItem} onTransform={onTransform} onAnimate={onAnimate} />
      ) : (
        // Handle video items
        <p>Video support is not implemented yet.</p>
      )}
    </>
  );
};

export default MediaItemComponent;
