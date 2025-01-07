import { CssBaseline, GlobalStyles, ThemeProvider } from '@mui/material';
import { withThemeFromJSXProvider } from '@storybook/addon-themes';
import { light } from '../packages/ui/src/themes/light';
import { dark } from '../packages/ui/src/themes/dark';

export const decorators = [
  withThemeFromJSXProvider({
    themes: {
      light: light,
      dark: dark,
    },
    defaultTheme: "light",
    Provider: ThemeProvider,
    GlobalStyles: CssBaseline,
  }),
  (Story) => (
    <>
      <GlobalStyles
        styles={{
          body: { fontFamily: "Open Sans, Nunito Sans, sans-serif" },
        }}
      />
      <ThemeProvider theme={light}>
        <CssBaseline />
        <Story />
      </ThemeProvider>
    </>
  ),
];