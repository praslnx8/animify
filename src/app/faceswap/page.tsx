'use client';

import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  Toolbar,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
  SwapHoriz as SwapHorizIcon,
} from '@mui/icons-material';
import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fileToBase64 } from '../utils/base64-utils';


interface FaceSwapResult {
  image_b64: string;
}

// Utility to extract base64 from data URL or return as-is if already plain
function extractBase64(data: string): string {
  if (!data) return '';
  const commaIdx = data.indexOf(',');
  return commaIdx !== -1 ? data.slice(commaIdx + 1) : data;
}

export default function FaceSwapPage() {
  const router = useRouter();
  const sourceFileInputRef = useRef<HTMLInputElement>(null);
  const targetFileInputRef = useRef<HTMLInputElement>(null);
  
  const [sourceImage, setSourceImage] = useState<string>('');
  const [targetImage, setTargetImage] = useState<string>('');
  const [sourceBase64, setSourceBase64] = useState<string>('');
  const [targetBase64, setTargetBase64] = useState<string>('');
  const [resultImage, setResultImage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleSourceImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setSourceBase64(base64);
        setSourceImage(`data:image/${file.type.split('/')[1]};base64,${base64}`);
      } catch (error) {
        setError('Failed to process source image');
      }
    }
  };

  const handleTargetImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setTargetBase64(base64);
        setTargetImage(`data:image/${file.type.split('/')[1]};base64,${base64}`);
      } catch (error) {
        setError('Failed to process target image');
      }
    }
  };

  const handleFaceSwap = async () => {
    if (!sourceBase64 || !targetBase64) {
      setError('Please select both source and target images');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const response = await fetch('/api/faceswap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_image_b64: sourceBase64,
          target_image_b64: targetBase64,
        }),
      });

      if (!response.ok) {
        throw new Error('Face swap failed');
      }

      const data: FaceSwapResult = await response.json();
      setResultImage(`data:image/jpeg;base64,${data.image_b64}`);
      setSuccess('Face swap completed successfully!');
    } catch (error) {
      setError('Failed to perform face swap. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;

    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `faceswap-result-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearImages = () => {
    setSourceImage('');
    setTargetImage('');
    setResultImage('');
    setError('');
    setSuccess('');
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="default">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => router.push('/')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Face Swap
          </Typography>
        </Toolbar>
      </AppBar>

      {isProcessing && <LinearProgress />}

      <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          {/* Image Upload Section */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Card sx={{ flex: 1, minWidth: 300 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Source Image (Face to copy)
                </Typography>
                <Box
                  sx={{
                    border: '2px dashed #ccc',
                    borderRadius: 2,
                    p: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    minHeight: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundImage: sourceImage ? `url(${sourceImage})` : 'none',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                  }}
                  onClick={() => sourceFileInputRef.current?.click()}
                >
                  {!sourceImage && (
                    <Box>
                      <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.500', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Click to upload source image
                      </Typography>
                    </Box>
                  )}
                </Box>
                <input
                  type="file"
                  ref={sourceFileInputRef}
                  onChange={handleSourceImageSelect}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </CardContent>
            </Card>

            <Card sx={{ flex: 1, minWidth: 300 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Target Image (Face to replace)
                </Typography>
                <Box
                  sx={{
                    border: '2px dashed #ccc',
                    borderRadius: 2,
                    p: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    minHeight: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundImage: targetImage ? `url(${targetImage})` : 'none',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                  }}
                  onClick={() => targetFileInputRef.current?.click()}
                >
                  {!targetImage && (
                    <Box>
                      <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.500', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Click to upload target image
                      </Typography>
                    </Box>
                  )}
                </Box>
                <input
                  type="file"
                  ref={targetFileInputRef}
                  onChange={handleTargetImageSelect}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </CardContent>
            </Card>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={<SwapHorizIcon />}
              onClick={handleFaceSwap}
              disabled={!sourceImage || !targetImage || isProcessing}
              size="large"
            >
              {isProcessing ? 'Processing...' : 'Swap Faces'}
            </Button>
            <Button
              variant="outlined"
              onClick={clearImages}
              disabled={isProcessing}
            >
              Clear All
            </Button>
          </Box>

          {/* Result Section */}
          {resultImage && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Result
                </Typography>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <img
                    src={resultImage}
                    alt="Face swap result"
                    style={{
                      maxWidth: '100%',
                      maxHeight: 400,
                      borderRadius: 8,
                    }}
                  />
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownload}
                    color="success"
                  >
                    Download Result
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert onClose={() => setError('')} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess('')}
      >
        <Alert onClose={() => setSuccess('')} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
}
