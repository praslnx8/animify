'use client';

import AddIcon from "@mui/icons-material/Add";
import ImageIcon from "@mui/icons-material/Image";
import {
  AppBar,
  Avatar,
  Box,
  Container,
  IconButton,
  List,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useRef, useState } from "react";
import PhotoItem from "./PhotoItem";

export default function HomePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const theme = useTheme();

  const handleAddPhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPhotos((prev) => [...prev, base64]);
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <Box
      sx={{
        minHeight: "100vh",
      }}
    >
      <AppBar position="sticky" elevation={2} color="default">
        <Toolbar>
          <Avatar sx={{ bgcolor: "background.paper", mr: 2 }}>
            <ImageIcon color="primary" />
          </Avatar>
          <Typography
            variant="h5"
            sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1 }}
          >
            Animify Photos
          </Typography>
          <IconButton
            color="inherit"
            onClick={handleAddPhotoClick}
            aria-label="add photo"
            size="large"
          >
            <AddIcon fontSize="large" />
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
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <List
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            p: 0,
          }}
        >
          {photos.map((photo, index) => (
            <PhotoItem key={index} base64={photo} />
          ))}
        </List>
      </Container>
    </Box>
  );
}
