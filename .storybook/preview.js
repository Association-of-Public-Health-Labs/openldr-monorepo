import { CssBaseline, GlobalStyles } from "@mui/material";
import { ThemeProvider, StyledEngineProvider, createTheme } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

import { light } from "../packages/ui/src/themes/light";
import { dark } from "../packages/ui/src/themes/dark";

const muiCache = createCache({
  key: "mui", // can be any unique key
  prepend: true, // ensure MUI styles are loaded first
});

export const globalTypes = {
  theme: {
    name: "Theme",
    description: "Global theme for components",
    defaultValue: "light", // Default theme
    toolbar: {
      icon: "circlehollow", // Icon for the toolbar
      items: [
        { value: "light", title: "Light Theme" },
        { value: "dark", title: "Dark Theme" },
      ],
    },
  },
};

export const lightTest = createTheme({
  palette: {
    primary: {
      main: "#FF0000", // bright red
    },
  },
});

export const decorators = [
  (Story, context) => {
    const theme = context.globals.theme === "dark" ? dark : light;

    return (
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Story />
        </ThemeProvider>

      </StyledEngineProvider>
    );
  },
];
 