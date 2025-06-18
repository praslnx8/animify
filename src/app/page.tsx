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
import { fileToBase64 } from './api/_utils/base64-utils';
import { uploadBase64Image } from './api/uploadBase64Image';
import MediaItemComponent from './components/MediaItemComponent';
import { MediaItem } from './models/MediaItem';
import { MediaType } from './models/MediaType';
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

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && currentIdx < mediaItems.length - 1) {
      setCurrentIdx((idx) => idx + 1);
    } else if (direction === 'right' && currentIdx > 0) {
      setCurrentIdx((idx) => idx - 1);
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
            onSwipe={handleSwipe}
            isTopCard={true}
            showActions
            onPrev={handlePrev}
            onNext={handleNext}
            isFirst={currentIdx === 0}
            isLast={currentIdx === mediaItems.length - 1}
          />
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
