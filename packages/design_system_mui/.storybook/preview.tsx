import React from "react"
import type { Preview } from "@storybook/react";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import { light } from "../src/themes/light";
import { dark } from "../src/themes/dark";

export const globalTypes = { 
  theme: {
    name: "Theme",
    description: "Global theme for components",
    defaultValue: "light",
    toolbar: {
      // You can choose any icon from the Storybook icon library
      icon: "circlehollow",
      items: [
        { value: "light", title: "Light" },
        { value: "dark", title: "Dark" },
      ],
    },
  }, 
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },

  // Decorators: wrap every story in MUI providers
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme === "dark" ? dark : light;
      return (
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Story />
          </ThemeProvider>
        </StyledEngineProvider>
      )
    },
  ],
};

export default preview;
