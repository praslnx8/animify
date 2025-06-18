'use client';

import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Toolbar,
  Typography
} from '@mui/material';
import 'keen-slider/keen-slider.min.css';
import React, { useEffect, useRef, useState } from 'react';
import { uploadBase64Image } from './api/uploadBase64Image';
import MediaItemComponent from './components/MediaItemComponent';
import { MediaItem } from './models/MediaItem';
import { MediaType } from './models/MediaType';
import { fileToBase64 } from './utils/base64-utils';
import {
  loadMediaItemsFromLocalStorage,
  saveMediaItemsToLocalStorage,
} from './utils/localStorage-utils';

export default function HomePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const stored = loadMediaItemsFromLocalStorage();
    if (stored.length) {
      setMediaItems(stored);
      setCurrentIdx(stored.length - 1);
    }
  }, [true]);

  useEffect(() => {
    saveMediaItemsToLocalStorage(mediaItems);
  }, [mediaItems]);

  const handleAddPhotoClick = () => fileInputRef.current?.click();
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const tempId = Date.now().toString();
    const newItem: MediaItem = { id: tempId, type: MediaType.Image, loading: true };
    setMediaItems((prev) => [...prev, newItem]);
    setCurrentIdx(mediaItems.length);

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

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx((idx) => idx - 1);
  };
  const handleNext = () => {
    if (currentIdx < mediaItems.length - 1) setCurrentIdx((idx) => idx + 1);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#111' }}>
      <AppBar position="sticky" color="default" sx={{ zIndex: 2 }}>
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

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: '#111',
        }}
      >
        {mediaItems.length > 0 ? (
          <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Left transparent click area */}
            <Box
              onClick={handlePrev}
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '15%',
                height: '75%', // Only cover the media area, not the bottom actions
                zIndex: 2,
                cursor: currentIdx === 0 ? 'default' : 'pointer',
                pointerEvents: currentIdx === 0 ? 'none' : 'auto',
                // No background, fully transparent
              }}
            />
            {/* Media item */}
            <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MediaItemComponent
                mediaItem={mediaItems[currentIdx]}
                addMediaItem={(mediaItem) => {
                  setMediaItems((prev) => [...prev, mediaItem]);
                  setCurrentIdx(mediaItems.length);
                }}
                updateMediaItem={(updatedItem) =>
                  setMediaItems((prev) =>
                    prev.map((item, idx) =>
                      item.id === updatedItem.id ? updatedItem : item
                    )
                  )
                }
                onDelete={(mediaItem) => {
                  setMediaItems((prev) => prev.filter((item) => item.id !== mediaItem.id));
                  if (currentIdx > 0) {
                    setCurrentIdx((idx) => idx - 1);
                  } else {
                    setCurrentIdx(0);
                  }
                }}
              />
            </Box>
            {/* Right transparent click area */}
            <Box
              onClick={handleNext}
              sx={{
                position: 'absolute',
                right: 0,
                top: 0,
                width: '15%',
                height: '75%', // Only cover the media area, not the bottom actions
                zIndex: 2,
                cursor: currentIdx === mediaItems.length - 1 ? 'default' : 'pointer',
                pointerEvents: currentIdx === mediaItems.length - 1 ? 'none' : 'auto',
                // No background, fully transparent
              }}
            />
            {/* Counter at top right */}
            <Box sx={{ position: 'absolute', top: 8, right: 16, bgcolor: 'background.paper', px: 1, py: 0.5, borderRadius: 2, boxShadow: 1, zIndex: 2, fontSize: 12 }}>
              <Typography variant="caption" color="text.secondary">
                {currentIdx + 1} / {mediaItems.length}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              width: '100vw',
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#111',
            }}
          >
            <Typography color="#fff">No media yet</Typography>
            <IconButton onClick={handleAddPhotoClick} sx={{ mt: 2, color: '#fff', background: '#222' }}>
              <AddIcon fontSize="large" />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
}
