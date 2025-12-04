'use client';

import {
  AppBar, Avatar, Box, Chip, Fab, IconButton,
  LinearProgress, Toolbar, Typography, Paper, Tooltip,
  Fade, Zoom, Badge
} from '@mui/material';
import {
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CloudUpload as CloudUploadIcon,
  AutoAwesome as AutoAwesomeIcon,
  Settings as SettingsIcon,
  Chat as ChatIcon,
  SwapHoriz as SwapHorizIcon,
  PhotoLibrary as PhotoLibraryIcon,
  Movie as MovieIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(true);
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

  // Scroll active thumbnail into view
  useEffect(() => {
    if (thumbnailContainerRef.current && mediaItems.length > 0) {
      const container = thumbnailContainerRef.current;
      const activeThumb = container.children[currentIdx] as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [currentIdx, mediaItems.length]);

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

  const handleSwipe = useCallback((start: number, end: number) => {
    const distance = start - end;
    if (distance > minSwipeDistance && currentIdx < mediaItems.length - 1) setCurrentIdx(i => i + 1);
    if (distance < -minSwipeDistance && currentIdx > 0) setCurrentIdx(i => i - 1);
  }, [currentIdx, mediaItems.length, minSwipeDistance]);

  const handleDelete = (mediaItem: MediaItem) => {
    const updated = mediaItems.filter(item => item.id !== mediaItem.id);
    setMediaItems(updated);
    setCurrentIdx(idx => Math.max(0, Math.min(idx, updated.length - 1)));
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && currentIdx > 0) {
      setCurrentIdx(i => i - 1);
    } else if (e.key === 'ArrowRight' && currentIdx < mediaItems.length - 1) {
      setCurrentIdx(i => i + 1);
    }
  }, [currentIdx, mediaItems.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const imageCount = mediaItems.filter(m => m.type === MediaType.Image).length;
  const videoCount = mediaItems.filter(m => m.type === MediaType.Video).length;

  return (
    <Box sx={{ 
      height: '100dvh', 
      display: 'flex', 
      flexDirection: 'column', 
      background: 'linear-gradient(180deg, #0d1117 0%, #161b22 100%)',
      overflow: 'hidden'
    }}>
      {/* Modern Header */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          bgcolor: 'rgba(13, 17, 23, 0.8)', 
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(48, 54, 61, 0.5)'
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: { xs: 1.5, sm: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
            <Avatar 
              sx={{ 
                width: 36, 
                height: 36,
                background: 'linear-gradient(135deg, #58a6ff 0%, #a371f7 100%)',
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(90deg, #fff 0%, #8b949e 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px'
              }}
            >
              Animify
            </Typography>
            {mediaItems.length > 0 && (
              <Fade in>
                <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                  {imageCount > 0 && (
                    <Chip 
                      icon={<ImageIcon sx={{ fontSize: 14 }} />}
                      label={imageCount}
                      size="small"
                      sx={statChipStyle}
                    />
                  )}
                  {videoCount > 0 && (
                    <Chip 
                      icon={<MovieIcon sx={{ fontSize: 14 }} />}
                      label={videoCount}
                      size="small"
                      sx={{ ...statChipStyle, bgcolor: 'rgba(163, 113, 247, 0.15)', color: '#a371f7' }}
                    />
                  )}
                </Box>
              </Fade>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: { xs: 0, sm: 0.5 } }}>
            <Tooltip title="Face Swap">
              <IconButton 
                onClick={() => router.push('/faceswap')} 
                disabled={isUploading}
                sx={headerIconStyle}
              >
                <SwapHorizIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Chat">
              <IconButton 
                onClick={() => router.push('/chat')} 
                disabled={isUploading}
                sx={headerIconStyle}
              >
                <ChatIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Settings">
              <IconButton 
                onClick={() => router.push('/config')} 
                disabled={isUploading}
                sx={headerIconStyle}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Add Photo">
              <IconButton 
                onClick={handleAddPhotoClick} 
                disabled={isUploading}
                sx={{
                  ...headerIconStyle,
                  bgcolor: 'rgba(88, 166, 255, 0.1)',
                  color: '#58a6ff',
                  '&:hover': { bgcolor: 'rgba(88, 166, 255, 0.2)' }
                }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
        {isUploading && (
          <LinearProgress 
            sx={{ 
              height: 2,
              bgcolor: 'rgba(88, 166, 255, 0.1)',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #58a6ff, #a371f7)'
              }
            }} 
          />
        )}
      </AppBar>

      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />

      {/* Main Content Area */}
      <Box
        sx={{ 
          flex: 1, 
          position: 'relative', 
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStart !== null) handleSwipe(touchStart, e.changedTouches[0].clientX);
          setTouchStart(null);
        }}
      >
        {mediaItems.length ? (
          <>
            {/* Navigation Arrows */}
            <Fade in={currentIdx > 0}>
              <IconButton
                onClick={() => setCurrentIdx(i => i - 1)}
                sx={navButtonStyle('left')}
                size="large"
              >
                <ChevronLeftIcon fontSize="large" />
              </IconButton>
            </Fade>

            <Fade in={currentIdx < mediaItems.length - 1}>
              <IconButton
                onClick={() => setCurrentIdx(i => i + 1)}
                sx={navButtonStyle('right')}
                size="large"
              >
                <ChevronRightIcon fontSize="large" />
              </IconButton>
            </Fade>

            {/* Media Display Area */}
            <Box sx={{ 
              flex: 1,
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              maxWidth: '600px',
              width: '100%',
              margin: '0 auto',
              p: { xs: 1, sm: 2 },
              pb: { xs: 1, sm: 2 },
              minHeight: 0
            }}>
              <Fade in key={currentIdx} timeout={200}>
                <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MediaItemComponent
                    mediaItem={mediaItems[currentIdx]}
                    addMediaItem={item => {
                      setMediaItems(prev => [...prev, item]);
                      setCurrentIdx(prev => prev + 1);
                    }}
                    updateMediaItem={updateMediaItem}
                    onDelete={handleDelete}
                  />
                </Box>
              </Fade>
            </Box>

            {/* Position Indicator */}
            <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}>
              <Chip 
                label={`${currentIdx + 1} / ${mediaItems.length}`} 
                size="small" 
                sx={positionChipStyle} 
              />
            </Box>

            {/* Thumbnail Strip */}
            {mediaItems.length > 1 && (
              <Paper
                elevation={0}
                sx={{
                  position: 'relative',
                  bgcolor: 'rgba(13, 17, 23, 0.9)',
                  backdropFilter: 'blur(8px)',
                  borderTop: '1px solid rgba(48, 54, 61, 0.5)',
                  py: 1.5,
                  px: 1,
                  flexShrink: 0
                }}
              >
                <Box
                  ref={thumbnailContainerRef}
                  sx={{
                    display: 'flex',
                    gap: 1,
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                    px: 1,
                    py: 0.5
                  }}
                >
                  {mediaItems.map((item, i) => (
                    <Box
                      key={item.id}
                      onClick={() => setCurrentIdx(i)}
                      sx={{
                        width: 56,
                        height: 56,
                        minWidth: 56,
                        borderRadius: 1.5,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: i === currentIdx ? '2px solid #58a6ff' : '2px solid transparent',
                        opacity: i === currentIdx ? 1 : 0.6,
                        transform: i === currentIdx ? 'scale(1.05)' : 'scale(1)',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        bgcolor: '#21262d',
                        '&:hover': {
                          opacity: 1,
                          transform: 'scale(1.05)'
                        }
                      }}
                    >
                      {item.loading ? (
                        <Box sx={{ 
                          width: '100%', 
                          height: '100%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          bgcolor: '#21262d'
                        }}>
                          <Box sx={{ 
                            width: 20, 
                            height: 20, 
                            border: '2px solid #30363d',
                            borderTopColor: '#58a6ff',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            '@keyframes spin': {
                              '0%': { transform: 'rotate(0deg)' },
                              '100%': { transform: 'rotate(360deg)' }
                            }
                          }} />
                        </Box>
                      ) : item.url ? (
                        <>
                          <img 
                            src={item.type === MediaType.Video && item.parent?.url ? item.parent.url : item.url} 
                            alt={`Thumbnail ${i + 1}`}
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover' 
                            }}
                          />
                          {item.type === MediaType.Video && (
                            <Box sx={{
                              position: 'absolute',
                              bottom: 2,
                              right: 2,
                              bgcolor: 'rgba(163, 113, 247, 0.9)',
                              borderRadius: 0.5,
                              p: 0.25,
                              display: 'flex'
                            }}>
                              <MovieIcon sx={{ fontSize: 12, color: '#fff' }} />
                            </Box>
                          )}
                        </>
                      ) : (
                        <Box sx={{ 
                          width: '100%', 
                          height: '100%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          bgcolor: '#21262d'
                        }}>
                          <ImageIcon sx={{ fontSize: 20, color: '#484f58' }} />
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              </Paper>
            )}
          </>
        ) : (
          /* Empty State */
          <Box sx={emptyStateStyle}>
            <Zoom in timeout={500}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(88, 166, 255, 0.1) 0%, rgba(163, 113, 247, 0.1) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    border: '2px dashed rgba(88, 166, 255, 0.3)'
                  }}
                >
                  <CloudUploadIcon sx={{ fontSize: 48, color: '#58a6ff' }} />
                </Box>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: '#e6edf3', 
                    fontWeight: 600,
                    mb: 1 
                  }}
                >
                  Welcome to Animify
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#8b949e', 
                    mb: 4, 
                    maxWidth: 320,
                    mx: 'auto',
                    lineHeight: 1.6
                  }}
                >
                  Transform your photos into stunning animations with AI-powered magic
                </Typography>
                <Fab 
                  color="primary" 
                  variant="extended"
                  onClick={handleAddPhotoClick} 
                  disabled={isUploading} 
                  sx={{ 
                    px: 4,
                    py: 1,
                    background: 'linear-gradient(135deg, #58a6ff 0%, #a371f7 100%)',
                    fontWeight: 600,
                    fontSize: '1rem',
                    boxShadow: '0 8px 32px rgba(88, 166, 255, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #79b8ff 0%, #b392f9 100%)',
                      boxShadow: '0 12px 40px rgba(88, 166, 255, 0.4)'
                    }
                  }}
                >
                  <AddIcon sx={{ mr: 1 }} />
                  Upload Photo
                </Fab>
                <Box sx={{ mt: 4, display: 'flex', gap: 3, justifyContent: 'center' }}>
                  {[
                    { icon: <PhotoLibraryIcon />, label: 'Upload Photos' },
                    { icon: <AutoAwesomeIcon />, label: 'AI Transform' },
                    { icon: <MovieIcon />, label: 'Animate' }
                  ].map((feature, idx) => (
                    <Box 
                      key={idx}
                      sx={{ 
                        textAlign: 'center',
                        color: '#8b949e'
                      }}
                    >
                      <Box sx={{ 
                        color: '#58a6ff', 
                        mb: 0.5,
                        opacity: 0.7
                      }}>
                        {feature.icon}
                      </Box>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                        {feature.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Zoom>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// Styles
const headerIconStyle = {
  color: '#8b949e',
  transition: 'all 0.2s ease',
  '&:hover': { 
    color: '#e6edf3',
    bgcolor: 'rgba(255, 255, 255, 0.05)'
  },
  '&:disabled': {
    color: '#484f58'
  }
};

const statChipStyle = {
  height: 22,
  fontSize: '0.7rem',
  fontWeight: 600,
  bgcolor: 'rgba(88, 166, 255, 0.15)',
  color: '#58a6ff',
  '& .MuiChip-icon': { 
    color: 'inherit',
    ml: 0.5
  }
};

const navButtonStyle = (side: 'left' | 'right') => ({
  position: 'absolute',
  top: '50%',
  [side]: { xs: 4, sm: 16 },
  transform: 'translateY(-50%)',
  bgcolor: 'rgba(13, 17, 23, 0.8)',
  backdropFilter: 'blur(4px)',
  color: '#e6edf3',
  zIndex: 10,
  border: '1px solid rgba(48, 54, 61, 0.5)',
  transition: 'all 0.2s ease',
  '&:hover': { 
    bgcolor: 'rgba(33, 38, 45, 0.95)',
    transform: 'translateY(-50%) scale(1.05)'
  }
});

const positionChipStyle = {
  bgcolor: 'rgba(13, 17, 23, 0.85)',
  backdropFilter: 'blur(4px)',
  color: '#e6edf3',
  fontWeight: 600,
  fontSize: '0.75rem',
  border: '1px solid rgba(48, 54, 61, 0.5)',
  px: 1
};

const emptyStateStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  px: 4,
  pb: 8
};
