'use client';

import AnimationIcon from "@mui/icons-material/Animation";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import {
  Card,
  CardActions,
  CardMedia,
  IconButton,
  Stack
} from "@mui/material";
import React from "react";
import { MediaItem } from "../models/MediaItem";
import { base64ToDataUrl } from "../utils/base64-utils";
import PhotoAnimateDialog from "./PhotoAnimateDialog";
import PhotoTransformDialog from "./PhotoTransformDialog";

export interface PhotoItemProps {
  mediaItem: MediaItem
  onTransform: (newBase64: string) => void;
  onAnimate: (videoUrl: string) => void;
}

const PhotoItemComponent: React.FC<PhotoItemProps> = ({ mediaItem, onTransform, onAnimate }) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [animateDialogOpen, setAnimateDialogOpen] = React.useState(false);

  return (
    <>
      <Card sx={{ mb: 2 }}>
        <CardMedia
          component="img"
          height="160"
          image={mediaItem.base64 ? base64ToDataUrl(mediaItem.base64) : undefined}
        />

        <CardActions disableSpacing>
          <Stack direction="row" spacing={1} ml="auto">
            <IconButton
              color="primary"
              aria-label="transform"
              onClick={() => setDialogOpen(true)}
            >
              <AutoFixHighIcon />
            </IconButton>

            <IconButton
              color="secondary"
              aria-label="animate"
              onClick={() => setAnimateDialogOpen(true)}
            >
              <AnimationIcon />
            </IconButton>
          </Stack>
        </CardActions>
      </Card>
      <PhotoTransformDialog
        open={dialogOpen}
        base64={mediaItem.base64!!}
        onClose={() => setDialogOpen(false)}
        onSuccess={(newBase64) => {
          setDialogOpen(false);
          onTransform(newBase64);
        }}
      />
      <PhotoAnimateDialog
        open={animateDialogOpen}
        mediaItem={mediaItem}
        onClose={() => setAnimateDialogOpen(false)}
        onSuccess={(url) => {
          setAnimateDialogOpen(false);
          onAnimate(url);
        }}
      />
    </>
  );
};

export default PhotoItemComponent;
