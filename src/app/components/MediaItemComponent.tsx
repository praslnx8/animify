'use client';

import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import React from "react";
import { MediaItem } from "../models/MediaItem";
import { MediaType } from "../models/MediaType";
import PhotoItemComponent from "./PhotoItemComponent";
import VideoItemComponent from "./VideoItemComponent";

export interface MediaItemProps {
  mediaItem: MediaItem,
  addMediaItem: (mediaItem: MediaItem) => void;
  updateMediaItem: (mediaItem: MediaItem) => void;
  onDelete: (mediaItem: MediaItem) => void;
}

const MediaItemComponent: React.FC<MediaItemProps> = ({ mediaItem, addMediaItem, updateMediaItem, onDelete }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (mediaItem.error || mediaItem.loading) {
    return (
      <Card sx={{ 
        height: { xs: 'calc(70vh)', sm: 'auto' },
        position: 'relative', 
        overflow: 'hidden', 
        p: 2,
        borderRadius: 2,
        boxShadow: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 3 }}>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => onDelete(mediaItem)}
            sx={{ minWidth: 0, p: 1, borderRadius: '50%' }}
            aria-label="Delete item"
          >
            <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
          </Button>
        </Box>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
          {mediaItem.loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <CircularProgress color="primary" size={isMobile ? 36 : 48} />
              {mediaItem.prompt && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">
                    Creating "{mediaItem.prompt}"
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Fade in={!!mediaItem.error}>
              <Box sx={{ 
                color: "error.main",
                p: 2,
                borderRadius: 1,
                backgroundColor: theme.palette.error.light + '20',
                textAlign: 'center'
              }}>
                <Typography variant="body2">{mediaItem.error}</Typography>
              </Box>
            </Fade>
          )}
        </Box>
      </Card>
    );
  }

  return (
    <Fade in={true} timeout={500}>
      <Box sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {mediaItem.prompt && (
          <Card sx={{ 
            p: 1.5,
            borderRadius: '8px 8px 0 0',
            backgroundColor: theme.palette.background.paper,
            boxShadow: 1
          }}>
            <Typography 
              variant="body2" 
              color="textSecondary" 
              sx={{ 
                fontStyle: 'italic',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {mediaItem.prompt}
            </Typography>
          </Card>
        )}

        <Box sx={{ position: 'relative', flex: 1, display: 'flex' }}>
          {mediaItem.type === MediaType.Image ? (
            <PhotoItemComponent
              mediaItem={mediaItem}
              addMediaItem={addMediaItem}
              updateMediaItem={updateMediaItem}
              onDelete={onDelete}
            />
          ) : (
            <VideoItemComponent
              mediaItem={mediaItem}
              onDelete={onDelete}
            />
          )}
        </Box>
      </Box>
    </Fade>
  );
};

export default MediaItemComponent;
