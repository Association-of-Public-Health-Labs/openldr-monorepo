"use client";

import React from "react"
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";

import { light } from "../themes/light";
import { dark } from "../themes/dark";
import { CssBaseline } from "@mui/material";

export function AppProvider({children, theme="light"}: {children: React.ReactNode, theme?:"light" | "dark"}) {
  const selectedTheme = theme === "light" ? light : dark;
  
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={selectedTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  )
}
                  
