"use client";

import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { ChatConfigProvider } from "./contexts/ChatConfigContext";
import { TransformConfigProvider } from "./contexts/TransformConfigContext";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9", // Lighter blue for dark mode
    },
    secondary: {
      main: "#ce93d8", // Lighter purple for dark mode
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        colorDefault: {
          backgroundColor: "#1e1e1e",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 42,
          height: 26,
          padding: 0,
        },
      },
    },
  },
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body style={{ 
        margin: 0, 
        padding: 0, 
        overflow: 'hidden',
        WebkitTapHighlightColor: 'transparent' 
      }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ChatConfigProvider>
            <TransformConfigProvider>
              {children}
            </TransformConfigProvider>
          </ChatConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
