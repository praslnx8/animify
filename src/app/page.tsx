'use client';

import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import { AppBar, Avatar, Box, IconButton, Toolbar, Typography, useTheme } from '@mui/material';
import 'keen-slider/keen-slider.min.css';
import { useKeenSlider } from 'keen-slider/react';
import React, { useEffect, useRef, useState } from 'react';
import { uploadBase64Image } from './api/uploadBase64Image';
import MediaItemComponent from './components/MediaItemComponent';
import { MediaItem } from './models/MediaItem';
import { MediaType } from './models/MediaType';
import { fileToBase64 } from './api/_utils/base64-utils';
import { loadMediaItemsFromLocalStorage, saveMediaItemsToLocalStorage } from './utils/localStorage-utils';

export default function HomePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({ loop: false });

  const theme = useTheme();

  useEffect(() => {
    const stored = loadMediaItemsFromLocalStorage();
    if (stored.length) {
      setMediaItems(stored);
      instanceRef.current?.moveToIdx(stored.length - 1);
    }
  }, []);

  useEffect(() => {
    saveMediaItemsToLocalStorage(mediaItems);
    if (instanceRef.current && mediaItems.length > 0) {
      instanceRef.current.moveToIdx(mediaItems.length - 1);
    }
  }, [mediaItems]);

  const handleAddPhotoClick = () => fileInputRef.current?.click();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const tempId = Date.now().toString();
    const newItem: MediaItem = { id: tempId, type: MediaType.Image, loading: true };
    setMediaItems((prev) => [...prev, newItem]);

    try {
      const base64 = await fileToBase64(file);
      const url = await uploadBase64Image(base64);
      setMediaItems((prev) =>
        prev.map((item) => item.id === tempId ? { ...item, url, loading: false } : item)
      );
    } catch {
      setMediaItems((prev) =>
        prev.map((item) => item.id === tempId ? { ...item, loading: false, error: 'Upload failed' } : item)
      );
    } finally {
      event.target.value = '';
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <AppBar position="sticky" color="default">
        <Toolbar>
          <Avatar sx={{ mr: 1 }}><ImageIcon color="primary" /></Avatar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Animify</Typography>
          <IconButton onClick={handleAddPhotoClick} color="primary"><AddIcon /></IconButton>
        </Toolbar>
      </AppBar>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileChange}
      />

      <Box ref={sliderRef} className="keen-slider" sx={{ flex: 1 }}>
        {mediaItems.length === 0 ? (
          <Box className="keen-slider__slide" sx={{
            height: '100%', display: 'flex', justifyContent: 'center',
            alignItems: 'center', flexDirection: 'column'
          }}>
            <Typography>No media yet</Typography>
            <IconButton onClick={handleAddPhotoClick} sx={{ mt: 2 }}>
              <AddIcon fontSize="large" />
            </IconButton>
          </Box>
        ) : (
          mediaItems.map((item) => (
            <Box key={item.id} className="keen-slider__slide" sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 2, height: '100%'
            }}>
              <MediaItemComponent
                mediaItem={item}
                addMediaItem={(mediaItem) => {
                  setMediaItems((prev) => {
                    const newItems = [...prev, mediaItem];
                    setTimeout(() => {
                      instanceRef.current?.moveToIdx(newItems.length - 1);
                    }, 100);
                    return newItems;
                  });
                }}
                updateMediaItem={(updatedItem) =>
                  setMediaItems((prev) =>
                    prev.map((item) =>
                      item.id === updatedItem.id ? updatedItem : item
                    )
                  )
                }
                onDelete={(deletedItem) =>
                  setMediaItems((prev) => {
                    const newItems = prev.filter((item) => item !== deletedItem);
                    if (instanceRef.current!.size >= newItems.length && newItems.length > 0) {
                      const newStep = newItems.length - 1;
                      instanceRef.current?.moveToIdx(newStep);
                    }
                    return newItems;
                  })
                }
              />
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}
