import { Theme } from "@mui/material/styles";

export type SettingsProps = {
  theme?: Theme;
  mode?: "light" | "dark";
  sidebar?: "column" | "row"; 
  lang?: "pt" | "en"; 
  layout?: "small" | "large"; 
  contrast?: "negative" | "positive";
  visited?: "yes" | "no";
}