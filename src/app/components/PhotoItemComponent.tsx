'use client';

import AnimationIcon from "@mui/icons-material/Animation";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  IconButton,
  Stack,
  Tooltip,
  Typography,
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
  const [isHovered, setIsHovered] = useState(false);
  const theme = useTheme();

  return (
    <>
      <Card 
        sx={{ 
          mb: 2,
          maxWidth: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: isHovered ? 6 : 1,
          transform: isHovered ? 'scale(1.02)' : 'scale(1)',
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Box sx={{ position: 'relative', paddingTop: '75%' /* 4:3 Aspect ratio */ }}>
          <CardMedia
            component="img"
            sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              backgroundColor: alpha(theme.palette.common.black, 0.04),
            }}
            image={mediaItem.base64 ? base64ToDataUrl(mediaItem.base64) : undefined}
            alt="Photo"
          />
        </Box>

        <CardActions 
          disableSpacing 
          sx={{ 
            padding: 1, 
            backgroundColor: isHovered ? alpha(theme.palette.background.paper, 0.9) : 'transparent',
            transition: 'background-color 0.2s',
          }}
        >
          <Stack direction="row" spacing={1} ml="auto">
            <Tooltip title="Transform">
              <IconButton
                size="medium"
                color="primary"
                aria-label="transform"
                onClick={() => setDialogOpen(true)}
              >
                <AutoFixHighIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Animate">
              <IconButton
                size="medium"
                color="secondary"
                aria-label="animate"
                onClick={() => setAnimateDialogOpen(true)}
              >
                <AnimationIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete">
              <IconButton
                size="medium"
                color="error"
                aria-label="delete"
                onClick={() => onDelete(mediaItem)}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </CardActions>
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
