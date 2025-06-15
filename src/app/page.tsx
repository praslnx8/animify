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
import React, { useCallback, useEffect, useRef, useState } from "react";
import MediaItemComponent from "./components/MediaItemComponent";
import { MediaItem } from "./models/MediaItem";
import { MediaType } from "./models/MediaType";
import { fileToBase64 } from "./utils/base64-utils";

const STORAGE_KEY = 'animify-media-items';
const MAX_STORAGE_SIZE = 4 * 1024 * 1024;

const wouldExceedStorageLimit = (data: string): boolean => {
  const currentStorage = Object.entries(localStorage).reduce(
    (total, [key, value]) => total + key.length + (value?.length || 0),
    0
  );
  const newItemSize = STORAGE_KEY.length + data.length;
  return currentStorage + newItemSize > MAX_STORAGE_SIZE;
};

export default function HomePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedMediaItems = localStorage.getItem(STORAGE_KEY);
      if (savedMediaItems) {
        setMediaItems(JSON.parse(savedMediaItems));
      }
    } catch (error) {
      console.error("Error loading media items from localStorage:", error);
      setStorageError("Failed to load saved items.");
    }
  }, []);

  const debouncedSave = useCallback((items: MediaItem[]) => {
    let timeoutId: NodeJS.Timeout | null = null;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      try {
        const dataToStore = JSON.stringify(items);

        if (wouldExceedStorageLimit(dataToStore)) {
          setStorageError("Storage limit reached. Some items may not be saved.");
          return;
        }

        localStorage.setItem(STORAGE_KEY, dataToStore);
        setStorageError(null);
      } catch (error) {
        console.error("Error saving to localStorage:", error);
        setStorageError("Failed to save changes.");
      }
    }, 500);
  }, []
  );

  useEffect(() => {
    if (mediaItems.length > 0) {
      debouncedSave(mediaItems);
    }
  }, [mediaItems, debouncedSave]);

  const handleAddPhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 2) { // 2MB limit
        setStorageError("Image is too large (>2MB). Please choose a smaller image.");
        return;
      }

      fileToBase64(file).then((base64) => {
        setMediaItems((prev) => [...prev, { id: Date.now().toString(), type: MediaType.Image, base64 }]);
      }).catch((error) => {
        console.error("Error converting file to base64:", error);
        setStorageError("Failed to process image.");
      });
    }
    if (event.target) {
      event.target.value = '';
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
        {storageError && (
          <Typography color="error" variant="body2" gutterBottom>
            {storageError}
          </Typography>
        )}
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
