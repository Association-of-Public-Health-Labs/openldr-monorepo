import { getDashboard, type DashboardId } from "../dashboards";

export type ThemeMode = "light" | "dark";

const FONT_FAMILY = '"Open Sans", "Nunito Sans", sans-serif';

// Values from the apps' previous themes/light.ts (identical in TB and VL).
function light(primary: string) {
  return {
    palette: {
      mode: "light",
      primary: { main: primary },
      secondary: { main: "#F8A200" },
      error: { main: "#EF5350" },
      success: { main: "#00B000" },
      warning: { main: "#F8A200" },
      info: { main: "#6B52DC" },
      background: { paper: "#fff", default: "#f4f4f4" },
      common: { black: "#000", white: "#fff" },
      text: {
        primary: "#333333",
        secondary: "#8996a0",
        disabled: "rgba(51, 51, 51, 0.4)",
      },
      contrastThreshold: 3,
      divider: "#e5e5e5",
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            border: "1px solid",
            borderColor: "hsl(240 4.8% 95.9%)",
            borderRadius: "16px",
          },
        },
      },
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
      ...Array(23).fill("none"),
    ],
    typography: { fontFamily: FONT_FAMILY, button: { textTransform: "none" } },
    shape: { borderRadius: 4 },
  };
}

// Values from the apps' previous themes/dark.ts (identical in TB and VL).
function dark(primary: string) {
  return {
    palette: {
      mode: "dark",
      primary: { main: primary },
      secondary: { main: "#F8A200" },
      error: { main: "#EF5350" },
      success: { main: "#00B000" },
      warning: { main: "#F8A200" },
      info: { main: "#6B52DC" },
      background: { paper: "#1d232a", default: "#141a21" },
      text: {
        primary: "#fff",
        secondary: "#8996a0",
        disabled: "rgba(255, 255, 255, 0.6)",
      },
      common: { black: "#000", white: "#fff" },
      contrastThreshold: 3,
      divider: "rgba(145, 158, 171, 0.24)",
    },
    typography: { fontFamily: FONT_FAMILY, button: { textTransform: "none" } },
    shape: { borderRadius: 4 },
  };
}

/** MUI ThemeOptions for a dashboard, as plain data. Pass to AppProvider, which calls createTheme. */
export function muiThemeOptions(dashboard: DashboardId, mode: ThemeMode): Record<string, any> {
  const { primary } = getDashboard(dashboard, {});
  return mode === "dark" ? dark(primary) : light(primary);
}
