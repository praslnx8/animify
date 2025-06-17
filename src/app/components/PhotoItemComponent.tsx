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
  IconButton,
  Tooltip
} from "@mui/material";
import React, { useState } from "react";
import { MediaItem } from "../models/MediaItem";
import PhotoAnimateDialog from "./PhotoAnimateDialog";
import PhotoTransformDialog from "./PhotoTransformDialog";

export interface PhotoItemProps {
  mediaItem: MediaItem;
  addMediaItem: (mediaItem: MediaItem) => void;
  updateMediaItem: (mediaItem: MediaItem) => void;
  onDelete: (mediaItem: MediaItem) => void;
}

const PhotoItemComponent: React.FC<PhotoItemProps> = ({
  mediaItem,
  addMediaItem,
  updateMediaItem,
  onDelete
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [animateDialogOpen, setAnimateDialogOpen] = useState(false);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);

  const toggleControls = () => setControlsVisible(!controlsVisible);

  return (
    <>
      <Card
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 2,
          boxShadow: 2,
          width: "100%",
          height: "100%",
        }}
        onClick={toggleControls}
      >
        <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
          <CardMedia
            component="img"
            image={mediaItem.url}
            alt="Photo"
            sx={{
              objectFit: "contain",
              width: "100%",
              height: "100%",
            }}
          />

          {/* Fullscreen button - always visible */}
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setFullscreenOpen(true);
            }}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
            }}
          >
            <FullscreenIcon fontSize="small" />
          </IconButton>

          {/* Action buttons - visible only when controlsVisible */}
          {controlsVisible && (
            <Box
              sx={{
                position: "absolute",
                bottom: 8,
                left: 8,
                right: 8,
                display: "flex",
                justifyContent: "space-between",
                borderRadius: 1,
                p: 1
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Tooltip title="Transform">
                <Button
                  onClick={() => setDialogOpen(true)}
                  sx={{ minWidth: 0, p: 1 }}
                >
                  <AutoFixHighIcon fontSize="small" sx={{ color: "#fff" }} />
                </Button>
              </Tooltip>
              <Tooltip title="Animate">
                <Button
                  onClick={() => setAnimateDialogOpen(true)}
                  sx={{ minWidth: 0, p: 1 }}
                >
                  <AnimationIcon fontSize="small" sx={{ color: "#fff" }} />
                </Button>
              </Tooltip>
              <Tooltip title="Delete">
                <Button
                  onClick={() => onDelete(mediaItem)}
                  sx={{ minWidth: 0, p: 1 }}
                >
                  <DeleteIcon fontSize="small" sx={{ color: "#fff" }} />
                </Button>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Card>

      {/* Fullscreen dialog */}
      <Dialog
        open={fullscreenOpen}
        onClose={() => setFullscreenOpen(false)}
        fullScreen
        onClick={() => setFullscreenOpen(false)}
      >
        <Box
          sx={{
            backgroundColor: "black",
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <img
            src={mediaItem.url}
            alt="Fullscreen"
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
          />
        </Box>
      </Dialog>

      <PhotoTransformDialog
        mediaItem={mediaItem}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        addMediaItem={(item) => {
          setDialogOpen(false);
          addMediaItem(item);
        }}
        updateMediaItem={(item) => {
          setDialogOpen(false);
          updateMediaItem(item);
        }}
      />

      <PhotoAnimateDialog
        mediaItem={mediaItem}
        open={animateDialogOpen}
        onClose={() => setAnimateDialogOpen(false)}
        addMediaItem={(item) => {
          setAnimateDialogOpen(false);
          addMediaItem(item);
        }}
        updateMediaItem={(item) => {
          setAnimateDialogOpen(false);
          updateMediaItem(item);
        }}
      />
    </>
  );
};

export default PhotoItemComponent;