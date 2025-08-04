import { createTheme } from "@mui/material/styles";
import {grey} from "@mui/material/colors";

export const dark = createTheme({
  palette: {
    mode: 'dark',
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
      paper: "#1d232a", 
      default: "#141a21"
    },
    text: {
      primary: "#fff",
      secondary: grey[500],
    },
    common: {
      black: "#000", 
      white: "#fff"
    },
    contrastThreshold: 3,
    divider: "rgba(145, 158, 171, 0.24)",
  },
  // @ts-ignore
  shadows: [ 
    "none", 
    "rgb(0 0 0 / 100%) 0px 0px 2px 0px, rgb(0 0 0 / 100%) 0px 12px 24px -4px",
    "rgb(0 0 0 / 100%) 0px 0px 2px 0px, rgb(0 0 0 / 100%) -20px 20px 40px -4px",
    ...Array(23).fill("none")
  ],
  typography: {
    fontFamily: '"Open Sans", "Nunito Sans", sans-serif',
    button: {
      textTransform: "none"
    }
  },
  shape: {
    borderRadius: 4
  },
})