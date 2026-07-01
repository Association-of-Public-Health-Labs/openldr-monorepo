import type { Theme } from "@mui/material/styles";

export type ReportColorVariant = "error" | "info" | "primary" | "secondary" | "success" | "warning";

export function getReportPalette(theme: Theme): Record<ReportColorVariant | "neutral", string> {
  const dark = theme.palette.mode === "dark";

  return {
    error: dark ? "#d98282" : "#c85c5c",
    info: dark ? "#74aee8" : "#3f88c5",
    neutral: dark ? "#9ca3af" : "#c7cdd4",
    primary: dark ? "#74aee8" : "#3f88c5",
    secondary: dark ? "#a58bd5" : "#8b6fc6",
    success: dark ? "#76b88a" : "#3f8f5f",
    warning: dark ? "#d9a464" : "#c58a3c",
  };
}

export function getReportColor(theme: Theme, variant: ReportColorVariant) {
  return getReportPalette(theme)[variant];
}
