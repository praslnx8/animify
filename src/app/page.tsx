'use client';

import AddIcon from "@mui/icons-material/Add";
import ImageIcon from "@mui/icons-material/Image";
import {
  AppBar,
  Avatar,
  Box,
  Container,
  IconButton,
  List,
  Toolbar,
  Typography
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import MediaItemComponent from "./components/MediaItemComponent";
import { MediaItem } from "./models/MediaItem";
import { MediaType } from "./models/MediaType";
import { fileToBase64 } from "./utils/base64-utils";

const STORAGE_KEY = 'animify_media_items';

export default function HomePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(localStorage.getItem(STORAGE_KEY) ? JSON.parse(localStorage.getItem(STORAGE_KEY)!) : []);

  useEffect(() => {
    if (mediaItems) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mediaItems));
    }
  }, [mediaItems]);

  const handleAddPhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      fileToBase64(file).then((base64) => {
        setMediaItems((prev) => [...prev, { id: Date.now().toString(), type: MediaType.Image, base64 }]);
      }).catch((error) => {
        console.error("Error converting file to base64:", error);
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
      }}
    >
      <AppBar position="sticky" elevation={2} color="default">
        <Toolbar>
          <Avatar sx={{ bgcolor: "background.paper", mr: 2 }}>
            <ImageIcon color="primary" />
          </Avatar>
          <Typography
            variant="h5"
            sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1 }}
          >
            Animify Photos
          </Typography>
          <IconButton
            color="inherit"
            onClick={handleAddPhotoClick}
            aria-label="add photo"
            size="large"
          >
            <AddIcon fontSize="large" />
          </IconButton>
        </Toolbar>
      </AppBar>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <List
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            p: 0,
          }}
        >
          {mediaItems.map((mediaItem, index) => (
            <MediaItemComponent
              key={index}
              mediaItem={mediaItem}
              addMediaItem={(mediaItem) =>
                setMediaItems((prev) => [...prev, mediaItem])
              }
              updateMediaItem={(updatedItem) =>
                setMediaItems((prev) =>
                  prev.map((item) =>
                    item.id === updatedItem.id ? updatedItem : item
                  )
                )}
              onDelete={(deletedItem) =>
                setMediaItems((prev) =>
                  prev.filter((item) => item !== deletedItem)
                )
              }
            />
          ))}
        </List>
      </Container>
    </Box>
  );
}
