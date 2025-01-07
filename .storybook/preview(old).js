import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { ThemeProvider } from '@emotion/react';

import { light } from '../packages/ui/src/themes/light';
import { dark } from '../packages/ui/src/themes/dark';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  multiTheme: {
    list: [
      {
        name: "Light",
        class: "light-theme", // this is handy if you set theme styles based on parent css class
        iconColor: "#fff",
        backgroundColor: `#fff`,
        selectedByDefault: true,
        wrapperComponent: ({children}) => {
          return (
            <MUIThemeProvider theme={light}>
              <ThemeProvider theme={dark}>
                {children}
              </ThemeProvider>
            </MUIThemeProvider>
          )
        }
      },
      {
        name: "Dark",
        class: "dark-theme",
        iconColor: "#231f29",
        backgroundColor: `#231f29`,
        wrapperComponent: ({children}) => {
          return (
            <MUIThemeProvider theme={light}>
               <ThemeProvider theme={dark}>
                  {children}
               </ThemeProvider>
            </MUIThemeProvider>
          )
        }
      },
    ]
  }
}