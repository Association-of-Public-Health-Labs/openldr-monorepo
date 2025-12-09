"use client";
import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";

const ThemeModeContext = createContext<{
  mode: "light" | "dark",
  toggleMode: (mode: "light" | "dark") => void,
}>({
  mode: "light",
  toggleMode: (mode: "light" | "dark") => {},
});

export function useThemeMode() {
  return useContext(ThemeModeContext);
}

export function ThemeModeProvider({ 
  children, 
  lightTheme, 
  darkTheme, 
  themeMode="light" 
}: { 
  children: React.ReactNode, 
  lightTheme: any, 
  darkTheme: any, 
  themeMode: "light" | "dark" 
}) {
  const [mode, setMode] = useState<"light" | "dark">(themeMode);

  // Sync mode with prop changes and update document classes
  useEffect(() => {
    if (themeMode) {
      setMode(themeMode);
      // Also update document classes when prop changes
      if (themeMode === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
      }
    }
  }, [themeMode]);

  // Save mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("color-mode", mode);
  }, [mode]);

  // Create theme with proper dependencies
  const theme = useMemo(
    () => (mode === "dark" ? darkTheme : lightTheme), 
    [mode, darkTheme, lightTheme]
  );
  
  const toggleMode = useCallback((newMode: "light" | "dark") => {
    setMode(newMode);

    if (newMode === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}