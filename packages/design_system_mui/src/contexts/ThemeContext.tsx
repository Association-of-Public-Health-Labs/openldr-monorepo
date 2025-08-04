"use client";
import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
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

  // Load mode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("color-mode");
    if (saved === "dark" || saved === "light") setMode(saved);
  }, []);

  // Save mode to localStorage
  useEffect(() => {
    localStorage.setItem("color-mode", mode);
  }, [mode]);

  const theme = useMemo(() => (mode === "dark" ? darkTheme : lightTheme), [mode]);
  
  const toggleMode = (mode: "light" | "dark") => {
    setMode(mode);

    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    // setTheme(mode);
  };

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}