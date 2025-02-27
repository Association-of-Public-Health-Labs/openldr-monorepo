import { createTheme } from "@mui/material/styles";

export const light = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: "#00B000",
    },
    secondary: {
      main: "#F8A200"
    },
    error: {
      main: "#EF5350"
    },
    success: {
      main: "#00B000"
    },
    warning: {
      main: "#F8A200"
    },
    info: {
      main: "#6B52DC"
    },
    background: {
      paper: "#fff", 
      default: "#f4f4f4",
    },
    common: {
      black: "#000", 
      white: "#fff"
    },
    text: {
      primary: "#333333",
      secondary: "#8996a0",
      disabled: "rgba(51, 51, 51, 0.4)",
    },
    contrastThreshold: 3,
    divider: "hsl(240 4.8% 95.9%)",
  },
  components: {
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "hsl(240 4.8% 95.9%)",
          borderWidth: "1px",
        },
      },
    },
  },
  shadows: [ 
    "none", 
    "rgb(145 158 171 / 20%) 0px 0px 2px 0px, rgb(145 158 171 / 12%) 0px 12px 24px -4px",
    "rgb(145 158 171 / 24%) 0px 0px 2px 0px, rgb(145 158 171 / 24%) -20px 20px 40px -4px",
    ...Array(23).fill("none")
  ],
  typography: {
    fontFamily: '"Open Sans", "Nunito Sans", sans-serif',
    button: {
      textTransform: "none"
    }
  },
  shape: {
    borderRadius: 4,
  },
})