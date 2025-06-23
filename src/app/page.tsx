'use client';

import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Toolbar,
  Typography,
  Fab,
  LinearProgress,
  Chip,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemText,
  Divider,
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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

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

    setIsUploading(true);
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
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx((idx) => idx - 1);
  };
  
  const handleNext = () => {
    if (currentIdx < mediaItems.length - 1) setCurrentIdx((idx) => idx + 1);
  };

  // Touch handlers for swipe navigation
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIdx < mediaItems.length - 1) {
      handleNext();
    }
    if (isRightSwipe && currentIdx > 0) {
      handlePrev();
    }
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      overflow: 'hidden', 
      background: '#111',
      // Safe area support for mobile
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      <AppBar position="sticky" color="default" sx={{ zIndex: 3 }}>
        <Toolbar>
          <Avatar sx={{ mr: 1 }}><ImageIcon color="primary" /></Avatar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Animify</Typography>
          <IconButton 
            onClick={handleAddPhotoClick} 
            color="primary"
            disabled={isUploading}
          >
            <AddIcon />
          </IconButton>
        </Toolbar>
        {isUploading && <LinearProgress />}
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
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {mediaItems.length > 0 ? (
          <Box sx={{ 
            position: 'relative', 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            {/* Navigation Indicators */}
            {currentIdx > 0 && (
              <IconButton
                onClick={handlePrev}
                sx={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 3,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.7)',
                  },
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
            )}
            
            {currentIdx < mediaItems.length - 1 && (
              <IconButton
                onClick={handleNext}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 3,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.7)',
                  },
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            )}

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

            {/* Counter and Navigation Hints */}
            <Box sx={{ 
              position: 'absolute', 
              top: 16, 
              right: 16, 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 1,
              zIndex: 3,
            }}>
              <Chip
                label={`${currentIdx + 1} / ${mediaItems.length}`}
                size="small"
                sx={{
                  bgcolor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  fontWeight: 'bold',
                }}
              />
              {mediaItems.length > 1 && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '10px',
                    textAlign: 'center',
                    bgcolor: 'rgba(0,0,0,0.5)',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                  }}
                >
                  Swipe to navigate
                </Typography>
              )}
            </Box>

            {/* Progress Dots */}
            {mediaItems.length > 1 && (
              <Box sx={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 1,
                zIndex: 3,
              }}>
                {mediaItems.map((_, index) => (
                  <Box
                    key={index}
                    onClick={() => setCurrentIdx(index)}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: index === currentIdx ? 'primary.main' : 'rgba(255,255,255,0.3)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'scale(1.2)',
                      },
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#111',
              px: 4,
              textAlign: 'center',
            }}
          >
            <CloudUploadIcon sx={{ fontSize: 80, color: '#444', mb: 2 }} />
            <Typography variant="h6" color="#fff" sx={{ mb: 1 }}>
              Welcome to Animify
            </Typography>
            <Typography variant="body2" color="#888" sx={{ mb: 4, maxWidth: 300 }}>
              Upload your first photo to start creating amazing animations and transformations
            </Typography>
            <Fab
              color="primary"
              onClick={handleAddPhotoClick}
              disabled={isUploading}
              sx={{
                width: 72,
                height: 72,
              }}
            >
              <AddIcon fontSize="large" />
            </Fab>
          </Box>
        )}
      </Box>
    </Box>
  );
}
