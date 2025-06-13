'use client';

import React from "react";
import { 
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Typography,
  Stack
} from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import AnimationIcon from "@mui/icons-material/Animation";

export interface PhotoItemProps {
  base64: string;
}

const PhotoItem: React.FC<PhotoItemProps> = ({ base64 }) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardMedia
        component="img"
        height="160"
        image={base64}
      />
      
      <CardActions disableSpacing>
        <Stack direction="row" spacing={1} ml="auto">
          <IconButton 
            color="primary" 
            aria-label="transform"
          >
            <AutoFixHighIcon />
          </IconButton>
          
          <IconButton 
            color="secondary" 
            aria-label="animate"
          >
            <AnimationIcon />
          </IconButton>
        </Stack>
      </CardActions>
    </Card>
  );
};

export default PhotoItem;
