'use client';

import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ImageIcon from "@mui/icons-material/Image";
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  MobileStepper,
  Paper,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSwipeable } from "react-swipeable";
import MediaItemComponent from "./components/MediaItemComponent";
import { MediaItem } from "./models/MediaItem";
import { MediaType } from "./models/MediaType";
import { fileToBase64 } from "./utils/base64-utils";
import { loadMediaItemsFromLocalStorage, saveMediaItemsToLocalStorage, StoredMediaItem } from "./utils/localStorage-utils";

// Styled components for the carousel
const CarouselContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '100%',
  position: 'relative',
  height: '100%',
}));

const CarouselItem = styled(Paper)(({ theme }) => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'transparent',
  boxShadow: 'none',
  position: 'absolute',
  top: 0,
  left: 0,
  transition: 'opacity 300ms ease, transform 300ms ease',
  willChange: 'transform, opacity', // Optimize for animations
}));

// Swipe indicators
const SwipeIndicator = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  width: 40,
  height: 40,
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.3)',
  color: theme.palette.primary.main,
  zIndex: 10,
  opacity: 0,
  transition: 'opacity 200ms ease',
}));

export default function HomePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<null | 'left' | 'right'>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSwipeIndicator, setShowSwipeIndicator] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const maxSteps = mediaItems.length;

  // Load media items from localStorage on first render
  useEffect(() => {
    // Only load from localStorage once during initialization
    if (!isInitialized) {
      const loadedItems = loadMediaItemsFromLocalStorage();
      if (loadedItems.length > 0) {
        console.log('Loaded items from localStorage:', loadedItems.length);
        setMediaItems(loadedItems);
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Save media items to localStorage whenever they change
  useEffect(() => {
    // Only save if already initialized (prevents saving empty array on first render)
    if (isInitialized) {
      saveMediaItemsToLocalStorage(mediaItems);
    }
  }, [mediaItems, isInitialized]);

  // Load media items from localStorage on component mount
  useEffect(() => {
    const storedMediaItems = loadMediaItemsFromLocalStorage();
    if (storedMediaItems.length > 0) {
      setMediaItems(storedMediaItems);
      setActiveStep(storedMediaItems.length - 1); // Set active step to the last item
    }
  }, []);

  // Save media items to localStorage whenever they change
  useEffect(() => {
    saveMediaItemsToLocalStorage(mediaItems);
  }, [mediaItems]);

  // Handle navigation with animation
  const handleNext = useCallback(() => {
    if (activeStep < maxSteps - 1 && !isAnimating) {
      setIsAnimating(true);
      setSwipeDirection('left');
      
      // Set animation timeout to change slide
      setTimeout(() => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        
        // Reset animation flags after a short delay
        setTimeout(() => {
          setSwipeDirection(null);
          setIsAnimating(false);
        }, 50);
      }, 300);
    }
  }, [activeStep, maxSteps, isAnimating]);

  const handleBack = useCallback(() => {
    if (activeStep > 0 && !isAnimating) {
      setIsAnimating(true);
      setSwipeDirection('right');
      
      // Set animation timeout to change slide
      setTimeout(() => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
        
        // Reset animation flags after a short delay
        setTimeout(() => {
          setSwipeDirection(null);
          setIsAnimating(false);
        }, 50);
      }, 300);
    }
  }, [activeStep, isAnimating]);
  
  // Configure swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipeStart: () => {
      setShowSwipeIndicator(true);
    },
    onSwiping: (eventData) => {
      // Show direction indicator based on swipe direction
      if (eventData.deltaX < 0 && activeStep < maxSteps - 1) {
        setSwipeDirection('left');
      } else if (eventData.deltaX > 0 && activeStep > 0) {
        setSwipeDirection('right');
      }
    },
    onSwipedLeft: () => {
      if (activeStep < maxSteps - 1 && !isAnimating) {
        handleNext();
      }
      setShowSwipeIndicator(false);
    },
    onSwipedRight: () => {
      if (activeStep > 0 && !isAnimating) {
        handleBack();
      }
      setShowSwipeIndicator(false);
    },
    onTouchEndOrOnMouseUp: () => {
      setShowSwipeIndicator(false);
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
    trackTouch: true,
    delta: 10, // Min distance in pixels to trigger swipe
    swipeDuration: 500, // Max time in ms for a swipe
  });

  const handleAddPhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      fileToBase64(file).then((base64) => {
        setMediaItems((prev) => {
          const newItems = [...prev, { id: Date.now().toString(), type: MediaType.Image, base64 }];
          // Set active step to the newest photo
          setTimeout(() => {
            setActiveStep(newItems.length - 1);
          }, 100);
          return newItems;
        });
      }).catch((error) => {
        console.error("Error converting file to base64:", error);
      });
    }
    if (event.target) {
      event.target.value = '';
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        maxHeight: "100vh"
      }}
    >
      <AppBar position="sticky" elevation={4} color="default">
        <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
          <Avatar sx={{ bgcolor: "rgba(144, 202, 249, 0.2)", mr: 1 }}>
            <ImageIcon color="primary" />
          </Avatar>
          <Typography
            variant={isMobile ? "h6" : "h5"}
            sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 0.5 }}
            noWrap
          >
            Animify Photos
          </Typography>
          <IconButton
            color="primary"
            onClick={handleAddPhotoClick}
            aria-label="add photo"
            size={isMobile ? "medium" : "large"}
          >
            <AddIcon fontSize={isMobile ? "medium" : "large"} />
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

      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'stretch'
      }}>
        {mediaItems.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              height: '100%',
              p: 3,
              background: 'radial-gradient(circle at center, rgba(144, 202, 249, 0.1) 0%, rgba(18, 18, 18, 0) 70%)'
            }}
          >
            <Typography variant="h6" color="primary" gutterBottom>
              No photos yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 300 }}>
              Add a photo to get started with transformations and animations
            </Typography>
            <IconButton
              color="primary"
              aria-label="add photo"
              onClick={handleAddPhotoClick}
              sx={{ 
                p: 2.5,
                border: `2px dashed ${theme.palette.primary.main}`,
                borderRadius: 2,
                bgcolor: 'rgba(144, 202, 249, 0.1)',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'rgba(144, 202, 249, 0.2)',
                  transform: 'scale(1.05)'
                }
              }}
            >
              <AddIcon fontSize="large" />
            </IconButton>
          </Box>
        ) : (
          <Box 
            {...swipeHandlers}
            sx={{ 
              width: '100%',
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              position: 'relative',
              overflow: 'hidden',
              touchAction: 'pan-y',  // Allow vertical scrolling
            }}
          >
            {/* Left swipe indicator */}
            <SwipeIndicator
              sx={{
                left: 16,
                opacity: (showSwipeIndicator && swipeDirection === 'right' && activeStep > 0) ? 1 : 0,
              }}
            >
              <ChevronLeftIcon />
            </SwipeIndicator>
            
            {/* Right swipe indicator */}
            <SwipeIndicator
              sx={{
                right: 16,
                opacity: (showSwipeIndicator && swipeDirection === 'left' && activeStep < maxSteps - 1) ? 1 : 0,
              }}
            >
              <ChevronRightIcon />
            </SwipeIndicator>
            
            <CarouselContainer>
              {mediaItems.map((mediaItem, index) => (
                <CarouselItem
                  key={mediaItem.id}
                  elevation={0}
                  sx={{
                    opacity: activeStep === index ? 1 : 0,
                    pointerEvents: activeStep === index ? 'auto' : 'none',
                    zIndex: activeStep === index ? 1 : 0,
                    transform: activeStep === index && swipeDirection === 'left' ? 'translateX(-10%)' : 
                              activeStep === index && swipeDirection === 'right' ? 'translateX(10%)' : 
                              'translateX(0)',
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      px: 2,
                      py: 1,
                    }}
                  >
                    <MediaItemComponent
                      mediaItem={mediaItem}
                      addMediaItem={(mediaItem) => {
                        setMediaItems((prev) => {
                          const newItems = [...prev, mediaItem];
                          // Navigate to the new item with a slight delay
                          setTimeout(() => {
                            setActiveStep(newItems.length - 1);
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
                          // Adjust active step if needed
                          if (activeStep >= newItems.length && newItems.length > 0) {
                            const newStep = newItems.length - 1;
                            setActiveStep(newStep);
                          }
                          return newItems;
                        })
                      }
                    />
                  </Box>
                </CarouselItem>
              ))}
            </CarouselContainer>

            {/* Navigation dots and controls */}
            {mediaItems.length > 0 && (
              <Box sx={{ px: 2, pb: 0, mt: 0, position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10 }}>
                <MobileStepper
                  steps={maxSteps}
                  position="static"
                  activeStep={activeStep}
                  sx={{
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    py: 0.5,
                    borderRadius: 2,
                    '& .MuiMobileStepper-dot': {
                      width: 8,
                      height: 8,
                      mx: 0.5,
                      backgroundColor: 'rgba(255, 255, 255, 0.3)'
                    },
                    '& .MuiMobileStepper-dotActive': {
                      backgroundColor: theme.palette.primary.main,
                    }
                  }}
                  nextButton={
                    <IconButton
                      size="small"
                      onClick={handleNext}
                      disabled={activeStep === maxSteps - 1 || maxSteps === 0}
                      sx={{
                        backgroundColor: activeStep < maxSteps - 1 ? 'rgba(144, 202, 249, 0.15)' : 'transparent',
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'rgba(144, 202, 249, 0.25)'
                        },
                        '&.Mui-disabled': {
                          opacity: 0.3
                        }
                      }}
                    >
                      <ChevronRightIcon />
                    </IconButton>
                  }
                  backButton={
                    <IconButton
                      size="small"
                      onClick={handleBack}
                      disabled={activeStep === 0 || maxSteps === 0}
                      sx={{
                        backgroundColor: activeStep > 0 ? 'rgba(144, 202, 249, 0.15)' : 'transparent',
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'rgba(144, 202, 249, 0.25)'
                        },
                        '&.Mui-disabled': {
                          opacity: 0.3
                        }
                      }}
                    >
                      <ChevronLeftIcon />
                    </IconButton>
                  }
                />
              </Box>
            )}

            {/* Swipe indicators */}
            <SwipeIndicator
              sx={{
                left: 16,
                opacity: swipeDirection === 'right' && isAnimating ? 1 : 0,
                transition: 'opacity 200ms ease',
              }}
            >
              <ChevronLeftIcon />
            </SwipeIndicator>
            <SwipeIndicator
              sx={{
                right: 16,
                opacity: swipeDirection === 'left' && isAnimating ? 1 : 0,
                transition: 'opacity 200ms ease',
              }}
            >
              <ChevronRightIcon />
            </SwipeIndicator>
          </Box>
        )}
      </Box>
    </Box>
  );
}
