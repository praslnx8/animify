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
import PhotoTransformDialog from "./PhotoTransformDialog";

export interface PhotoItemProps {
  base64: string;
  onTransform?: (newBase64: string) => void;
}

const PhotoItem: React.FC<PhotoItemProps> = ({ base64, onTransform }) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  return (
    <>
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
              onClick={() => setDialogOpen(true)}
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
      <PhotoTransformDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={(newBase64) => {
          setDialogOpen(false);
          onTransform && onTransform(newBase64);
        }}
        base64={base64}
      />
    </>
  );
};

export default PhotoItem;
