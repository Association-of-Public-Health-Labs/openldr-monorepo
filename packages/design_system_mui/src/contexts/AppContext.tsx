"use client";
import React from "react"
import { createTheme } from "@mui/material/styles";
import { ThemeModeProvider } from "./ThemeContext";

export function AppProvider({children, lightTheme, darkTheme, themeMode}: {
  children: React.ReactNode, 
  lightTheme?: any,
  darkTheme?: any,
  themeMode?: "light" | "dark",
  setTheme?: (theme: string) => void
}) {
  const light = createTheme(lightTheme)
  const dark = createTheme(darkTheme)

  return (
    <ThemeModeProvider 
      lightTheme={light} 
      darkTheme={dark} 
      themeMode={themeMode}
      // setTheme={setTheme}
    >
      {children}
    </ThemeModeProvider>
  )
}
                  
