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
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useCallback, useEffect, useRef, useState } from "react";
import MediaItemComponent from "./components/MediaItemComponent";
import { MediaItem } from "./models/MediaItem";
import { MediaType } from "./models/MediaType";
import { fileToBase64 } from "./utils/base64-utils";

// Styled component for the swipeable container
const SwipeableContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  overflowX: 'hidden',
  width: '100%',
  position: 'relative',
  touchAction: 'pan-y',
}));

export default function HomePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const swiperRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDelta, setSwipeDelta] = useState(0);
  const touchStartTimeRef = useRef(0);
  const isScrollingRef = useRef(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const maxSteps = mediaItems.length;

  // Handle navigation
  const handleNext = useCallback(() => {
    if (activeStep < maxSteps - 1) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      scrollToItem(activeStep + 1);
    }
  }, [activeStep, maxSteps]);

  const handleBack = useCallback(() => {
    if (activeStep > 0) {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
      scrollToItem(activeStep - 1);
    }
  }, [activeStep]);

  // Scroll to specific item with smooth animation
  const scrollToItem = useCallback((index: number) => {
    if (swiperRef.current) {
      isScrollingRef.current = true;
      const container = swiperRef.current;
      const scrollAmount = container.clientWidth * index;

      container.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });

      // Reset scrolling flag after animation completes
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 300);
    }
  }, []);

  // Update active item when activeStep changes
  useEffect(() => {
    if (swiperRef.current && !isSwiping && !isScrollingRef.current) {
      scrollToItem(activeStep);
    }
  }, [activeStep, isSwiping, scrollToItem]);

  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    // Prevent swiping if already scrolling from a button press
    if (isScrollingRef.current) return;

    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
    touchStartTimeRef.current = Date.now();
    setIsSwiping(true);
    setSwipeDelta(0);

    // Prevent default to avoid any conflict with other touch handlers
    if (mediaItems.length > 1) {
      e.stopPropagation();
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isSwiping) {
      currentXRef.current = e.touches[0].clientX;
      const delta = currentXRef.current - startXRef.current;

      // Limit swipe in edge cases
      if ((activeStep === 0 && delta > 0) ||
        (activeStep === maxSteps - 1 && delta < 0)) {
        setSwipeDelta(delta * 0.2); // Reduced effect for "rubber band" feeling
      } else {
        setSwipeDelta(delta);
      }

      // Prevent default to stop page scrolling
      if (Math.abs(delta) > 10) { // Small threshold to avoid stopping tiny movements
        e.preventDefault();
        e.stopPropagation();
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isSwiping) {
      const delta = currentXRef.current - startXRef.current;
      const timeDelta = Date.now() - touchStartTimeRef.current;
      const velocity = Math.abs(delta) / timeDelta;

      // Navigate based on swipe distance or velocity
      if (Math.abs(delta) > 50 || velocity > 0.15) {
        if (delta > 0 && activeStep > 0) {
          handleBack();
        } else if (delta < 0 && activeStep < maxSteps - 1) {
          handleNext();
        } else {
          // If we can't navigate (at the end), snap back
          scrollToItem(activeStep);
        }
      } else {
        // For small movements, snap back to current item
        scrollToItem(activeStep);
      }

      // If this was a significant swipe, prevent it from triggering other events
      if (Math.abs(delta) > 10) {
        e.stopPropagation();
      }

      setIsSwiping(false);
      setSwipeDelta(0);
    }
  };

  // Also handle touch cancel event (e.g., when system UI appears)
  const handleTouchCancel = () => {
    if (isSwiping) {
      // Just snap back to current position on cancel
      scrollToItem(activeStep);
      setIsSwiping(false);
      setSwipeDelta(0);
    }
  };

  // Mouse-based swiping for desktop 
  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent swiping if already scrolling from a button press
    if (isScrollingRef.current) return;

    startXRef.current = e.clientX;
    currentXRef.current = e.clientX;
    touchStartTimeRef.current = Date.now();
    setIsSwiping(true);
    setSwipeDelta(0);

    // Add window-level event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isSwiping) {
      currentXRef.current = e.clientX;
      const delta = currentXRef.current - startXRef.current;

      // Limit swipe in edge cases
      if ((activeStep === 0 && delta > 0) ||
        (activeStep === maxSteps - 1 && delta < 0)) {
        setSwipeDelta(delta * 0.2);
      } else {
        setSwipeDelta(delta);
      }
    }
  }, [isSwiping, activeStep, maxSteps]);

  const handleMouseUp = useCallback(() => {
    if (isSwiping) {
      const delta = currentXRef.current - startXRef.current;
      const timeDelta = Date.now() - touchStartTimeRef.current;
      const velocity = Math.abs(delta) / timeDelta;

      if (Math.abs(delta) > 100 || velocity > 0.15) {
        if (delta > 0 && activeStep > 0) {
          handleBack();
        } else if (delta < 0 && activeStep < maxSteps - 1) {
          handleNext();
        } else {
          scrollToItem(activeStep);
        }
      } else {
        scrollToItem(activeStep);
      }

      setIsSwiping(false);
      setSwipeDelta(0);

      // Remove window-level event listeners
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isSwiping, activeStep, maxSteps, handleBack, handleNext, scrollToItem, handleMouseMove]);

  // Cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Sync active step with scroll position
  const handleScroll = useCallback(() => {
    if (!isSwiping && !isScrollingRef.current && swiperRef.current) {
      const container = swiperRef.current;
      const scrollLeft = container.scrollLeft;
      const itemWidth = container.clientWidth;
      const newActiveStep = Math.round(scrollLeft / itemWidth);

      // Only update if it's different to avoid infinite loops
      if (newActiveStep !== activeStep && newActiveStep >= 0 && newActiveStep < maxSteps) {
        setActiveStep(newActiveStep);
      }
    }
  }, [activeStep, isSwiping, maxSteps]);

  useEffect(() => {
    const container = swiperRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

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
          // Set active step to the newest photo with a slight delay to ensure DOM updates
          setTimeout(() => {
            setActiveStep(newItems.length - 1);
            scrollToItem(newItems.length - 1);
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
          <Box sx={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {/* Carousel container */}
            <SwipeableContainer
              ref={swiperRef}
              sx={{
                overflowX: 'auto',
                overflowY: 'hidden',
                scrollSnapType: 'x mandatory',
                scrollBehavior: 'smooth',
                scrollbarWidth: 'none', // Hide scrollbar for Firefox
                '&::-webkit-scrollbar': {
                  display: 'none', // Hide scrollbar for Chrome/Safari
                },
                transform: isSwiping ? `translateX(${swipeDelta}px)` : 'translateX(0)',
                transition: isSwiping ? 'none' : 'transform 0.3s ease',
                flex: 1,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                WebkitOverflowScrolling: 'touch', // Smoother scrolling on iOS
                height: '100%', // Ensure consistent height
                maxHeight: '100%', // Prevent overflow
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchCancel}
              onMouseDown={handleMouseDown}
            >
              {mediaItems.map((mediaItem, index) => (
                <Box
                  key={index}
                  sx={{
                    minWidth: '100%',
                    width: '100%',
                    height: '100%', // Full height
                    flexShrink: 0,
                    scrollSnapAlign: 'start',
                    scrollSnapStop: 'always', // Force snap points
                    px: 2,
                    pb: 0,
                    pt: 0,
                    boxSizing: 'border-box',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden' // Prevent content overflow
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
                          scrollToItem(newItems.length - 1);
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
                          scrollToItem(newStep);
                        }
                        return newItems;
                      })
                    }
                  />
                </Box>
              ))}
            </SwipeableContainer>

            {/* Navigation dots and controls */}
            {mediaItems.length > 0 && (
              <Box sx={{ px: 2, pb: 0, mt: 0 }}>
                <MobileStepper
                  steps={maxSteps}
                  position="static"
                  activeStep={activeStep}
                  sx={{
                    backgroundColor: 'transparent',
                    py: 0.5,
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
                      disabled={activeStep === maxSteps - 1}
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
                      disabled={activeStep === 0}
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
          </Box>
        )}
      </Box>
    </Box>
  );
}
