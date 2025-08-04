
import React from 'react';
import type { Preview } from '@storybook/react-vite';
import '../src/index.css';
import { ThemeProvider } from '../src/contexts/theme-provider';
import { ThemeToggle } from '../src/components/theme-toggle';
import { withThemeByClassName } from '@storybook/addon-themes';

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider as MuiStylesThemeProvider, StyledEngineProvider as MuiStyledEngineProvider } from "@mui/material/styles";
import { ThemeProvider as MUIThemeProvider, StyledEngineProvider } from "@mui/material";
import { light as muiLight } from '../src/themes/light';
import { dark as muiDark } from '../src/themes/dark';

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
  decorators: [
    withThemeByClassName({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
    (Story, context) => {
      const theme = context.globals.theme;
      const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia?.('(prefers-color-scheme: dark)').matches);
      const muiTheme = isDark ? muiDark : muiLight;

      return (
        <StyledEngineProvider injectFirst>
          {/* <ThemeProvider defaultTheme={theme} storageKey="storybook-theme"> */}
              <MUIThemeProvider theme={muiTheme}>
                <MuiStylesThemeProvider theme={muiTheme}>
                  <CssBaseline />
                  {/* <div className="min-h-screen bg-background text-foreground transition-colors"> */}
                  <div className={`min-h-screen transition-colors ${isDark ? 'dark' : 'light'}`}>
                    {/* <ThemeToggle /> */}
                    {/* <div className="p-4"> */}
                    <div className="p-4 bg-background text-foreground">
                      <Story />
                    </div>
                  </div>

                </MuiStylesThemeProvider>
              </MUIThemeProvider>
          {/* </ThemeProvider> */}
        </StyledEngineProvider>
      );
    },
  ],
};

export default preview;
