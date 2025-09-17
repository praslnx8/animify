'use client';

import {
  AppBar, Avatar, Box, Chip, Fab, IconButton,
  LinearProgress, Toolbar, Typography
} from '@mui/material';
import {
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon,
  Settings as SettingsIcon,
  Chat as ChatIcon,
  SwapHoriz as SwapHorizIcon
} from '@mui/icons-material';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const minSwipeDistance = 50;

  useEffect(() => {
    const stored = loadMediaItemsFromLocalStorage();
    if (stored.length) {
      setMediaItems(stored);
      setCurrentIdx(stored.length - 1);
    }
  }, []);

  useEffect(() => {
    saveMediaItemsToLocalStorage(mediaItems);
  }, [mediaItems]);

  const handleAddPhotoClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const tempId = Date.now().toString();
    const newItem: MediaItem = { id: tempId, type: MediaType.Image, loading: true };
    setMediaItems(prev => [...prev, newItem]);
    setCurrentIdx(mediaItems.length);

    try {
      const base64 = await fileToBase64(file);
      const url = await uploadBase64Image(base64);
      updateMediaItem({ id: tempId, url, loading: false });
    } catch {
      updateMediaItem({ id: tempId, loading: false, error: 'Upload failed' });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const updateMediaItem = (updated: Partial<MediaItem> & { id: string }) => {
    setMediaItems(prev => prev.map(item =>
      item.id === updated.id ? { ...item, ...updated } : item
    ));
  };

  const handleSwipe = (start: number, end: number) => {
    const distance = start - end;
    if (distance > minSwipeDistance && currentIdx < mediaItems.length - 1) setCurrentIdx(i => i + 1);
    if (distance < -minSwipeDistance && currentIdx > 0) setCurrentIdx(i => i - 1);
  };

  const handleDelete = (mediaItem: MediaItem) => {
    const updated = mediaItems.filter(item => item.id !== mediaItem.id);
    setMediaItems(updated);
    setCurrentIdx(idx => Math.max(0, idx - 1));
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#111' }}>
      <AppBar position="sticky" color="default">
        <Toolbar>
          <Avatar sx={{ mr: 1 }}><ImageIcon color="primary" /></Avatar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Animify</Typography>
          <IconButton onClick={() => router.push('/faceswap')} color="primary" disabled={isUploading}>
            <SwapHorizIcon />
          </IconButton>
          <IconButton onClick={() => router.push('/chat')} color="primary" disabled={isUploading}>
            <ChatIcon />
          </IconButton>
          <IconButton onClick={() => router.push('/config')} color="primary" disabled={isUploading}>
            <SettingsIcon />
          </IconButton>
          <IconButton onClick={handleAddPhotoClick} color="primary" disabled={isUploading}>
            <AddIcon />
          </IconButton>
        </Toolbar>
        {isUploading && <LinearProgress />}
      </AppBar>

      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />

      <Box
        sx={{ flex: 1, position: 'relative', overflow: 'hidden', pb: '56px' }}
        onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStart !== null) handleSwipe(touchStart, e.changedTouches[0].clientX);
          setTouchStart(null);
        }}
      >
        {mediaItems.length ? (
          <>
            {currentIdx > 0 && (
              <IconButton
                onClick={() => setCurrentIdx(i => i - 1)}
                sx={navButtonStyle('left')}
              ><ChevronLeftIcon /></IconButton>
            )}

            {currentIdx < mediaItems.length - 1 && (
              <IconButton
                onClick={() => setCurrentIdx(i => i + 1)}
                sx={navButtonStyle('right')}
              ><ChevronRightIcon /></IconButton>
            )}

            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MediaItemComponent
                mediaItem={mediaItems[currentIdx]}
                addMediaItem={item => {
                  setMediaItems(prev => [...prev, item]);
                  setCurrentIdx(mediaItems.length);
                }}
                updateMediaItem={updateMediaItem}
                onDelete={handleDelete}
              />
            </Box>

            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
              <Chip label={`${currentIdx + 1} / ${mediaItems.length}`} size="small" sx={chipStyle} />
            </Box>

            {mediaItems.length > 1 && (
              <Box sx={dotContainerStyle}>
                {mediaItems.map((_, i) => (
                  <Box
                    key={i}
                    onClick={() => setCurrentIdx(i)}
                    sx={{
                      width: 8, height: 8, borderRadius: '50%',
                      bgcolor: i === currentIdx ? 'primary.main' : 'rgba(255,255,255,0.3)',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </Box>
            )}
          </>
        ) : (
          <Box sx={emptyStateStyle}>
            <CloudUploadIcon sx={{ fontSize: 80, color: '#444', mb: 2 }} />
            <Typography variant="h6" color="#fff" sx={{ mb: 1 }}>Welcome to Animify</Typography>
            <Typography variant="body2" color="#888" sx={{ mb: 4, maxWidth: 300 }}>
              Upload your first photo to start creating animations
            </Typography>
            <Fab color="primary" onClick={handleAddPhotoClick} disabled={isUploading} sx={{ width: 72, height: 72 }}>
              <AddIcon fontSize="large" />
            </Fab>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// Reusable styles
const navButtonStyle = (side: 'left' | 'right') => ({
  position: 'absolute',
  top: '50%',
  [side]: 8,
  transform: 'translateY(-50%)',
  bgcolor: 'rgba(0,0,0,0.5)',
  color: 'white',
  zIndex: 3,
  '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
});

const chipStyle = {
  bgcolor: 'rgba(0,0,0,0.7)',
  color: 'white',
  fontWeight: 'bold'
};

const dotContainerStyle = {
  position: 'absolute',
  bottom: 16,
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: 1,
  zIndex: 3
};

const emptyStateStyle = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  px: 4
};
