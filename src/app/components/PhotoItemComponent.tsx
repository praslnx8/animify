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
import PhotoTransformDialog from "./PhotoTransformDialog";
import { base64ToDataUrl } from "../utils/base64-utils";

export interface PhotoItemProps {
  mediaItem: MediaItem
  onTransform: (newBase64: string) => void;
}

const PhotoItemComponent: React.FC<PhotoItemProps> = ({ mediaItem, onTransform }) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);

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
          onTransform && onTransform(newBase64);
        }}
      />
    </>
  );
};

export default PhotoItemComponent;
