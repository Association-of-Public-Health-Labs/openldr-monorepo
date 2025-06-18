import React, { MouseEvent, KeyboardEvent, useState } from "react";
import {
  IconButton,
  Box,
  Drawer,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  SvgIcon,
  Button,
  Switch
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { IoOptionsOutline, IoClose, IoChevronBack, IoChevronForward, IoContrastSharp } from "react-icons/io5";
import { TbContrast } from "react-icons/tb";
import { MdModeNight, MdLightMode } from "react-icons/md";
import hexToRgba from "hex-to-rgba";
import { useThemeMode } from "../../contexts/ThemeContext";
import { IconlyMooncloudy } from "../../atoms/icons/IconlyMooncloudy";
import { IconlyMask } from "../../atoms/icons/IconlyMask";
import { SettingsIcon } from "../../atoms/icons/Settings";

export const SettingsDrawerStep = {
  selector: "settings-drawer",
  content: "Neste butão tens as configurações da aplicação, nomeadamente: o Tema, a orientação da Barra de Navegação, a Língua, o Contraste e o Layout da Página"
}

type Anchor = "top" | "left" | "bottom" | "right";

export type SettingsProps = {
  mode: "light" | "dark"
  contrast: "positive" | "negative"
  layout: "expanded" | "compact" | "stacked"
  compact: "small" | "large"
  color: "integrate" | "apparent"
  rightPanelWidth: number
  leftPanelWidth: number
}

export type SettingsDrawerProps = {
  settings: SettingsProps
  handleSetAppSettings: (settings: SettingsProps) => void
}

export function SettingsDrawer({settings, handleSetAppSettings}: SettingsDrawerProps) {
  const theme = useTheme();
  const { mode: currentMode, toggleMode } = useThemeMode();
  const [mode, setMode] = useState<"light" | "dark">(currentMode);
  const [layout, setLayout] = useState<"expanded" | "compact" | "stacked">("expanded");
  const [compact, setCompact] = useState<"small" | "large">("large");
  const [contrast, setContrast] = useState<"positive" | "negative">("negative");
  const [color, setColor] = useState<"integrate" | "apparent">("integrate");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const [state, setState] = useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });

  const toggleDrawer = (anchor: Anchor, open: boolean) =>
    (event: KeyboardEvent | MouseEvent) => {
      if (
        event.type === "keydown" &&
        ((event as KeyboardEvent).key === "Tab" ||
          (event as KeyboardEvent).key === "Shift")
      ) {
        return;
      }

      setState({ ...state, [anchor]: open });
    };

  const handleChangeMode = (
    mode: "light" | "dark",
  ) => {
    toggleMode(mode);
    setMode(mode);
    handleSetAppSettings({ ...settings, mode: mode });
  };

  const handleChangeLayout = (
    event: MouseEvent<HTMLElement>,
    layout: "expanded" | "compact" | "stacked",
  ) => {
    setLayout(layout);
    handleSetAppSettings({ ...settings, layout: layout });
  };

  const handleChangeContrast = (
    event: MouseEvent<HTMLElement>,
    contrast: "negative" | "positive",
  ) => {
    setContrast(contrast);
    handleSetAppSettings({ ...settings, contrast: contrast });
  };

  const handleChangeCompact = (compact: "small" | "large") => {
    setCompact(compact);
    handleSetAppSettings({ ...settings, compact: compact });
  };

  const handleChangeColor = (
    event: MouseEvent<HTMLElement>,
    color: "integrate" | "apparent",
  ) => {
    setColor(color);
    handleSetAppSettings({ ...settings, color: color });
  };

  return (
    <>
      <IconButton
        className={SettingsDrawerStep.selector}
        aria-label="settings"
        size="medium"
        onClick={toggleDrawer("right", true)}
      >
        <SettingsIcon 
          size={28} 
          color={theme.palette.mode === "dark" ? "white" : "#444444"} 
        />
      </IconButton>
      <Drawer
        anchor="right"
        open={state["right"]}
        onClose={toggleDrawer("right", false)}
        sx={{
          height: "100%",
          "& .MuiBackdrop-root": {
            backgroundColor: "transparent"
          },
          "& .MuiPaper-root.MuiPaper-elevation": {
            backgroundColor: theme => hexToRgba(theme.palette.background.paper, "0.92"),
            borderRadius: 0,
            height: "100%",
            top: 0,
            boxShadow: 2,
            backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSJ1cmwoI3BhaW50MF9yYWRpYWxfNDQ2NF81NTMzOCkiIGZpbGwtb3BhY2l0eT0iMC4xIi8+CjxkZWZzPgo8cmFkaWFsR3JhZGllbnQgaWQ9InBhaW50MF9yYWRpYWxfNDQ2NF81NTMzOCIgY3g9IjAiIGN5PSIwIiByPSIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09InRyYW5zbGF0ZSgxMjAgMS44MTgxMmUtMDUpIHJvdGF0ZSgtNDUpIHNjYWxlKDEyMy4yNSkiPgo8c3RvcCBzdG9wLWNvbG9yPSIjMDBCOEQ5Ii8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzAwQjhEOSIgc3RvcC1vcGFjaXR5PSIwIi8+CjwvcmFkaWFsR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg=='), url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSJ1cmwoI3BhaW50MF9yYWRpYWxfNDQ2NF81NTMzNykiIGZpbGwtb3BhY2l0eT0iMC4xIi8+CjxkZWZzPgo8cmFkaWFsR3JhZGllbnQgaWQ9InBhaW50MF9yYWRpYWxfNDQ2NF81NTMzNyIgY3g9IjAiIGN5PSIwIiByPSIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09InRyYW5zbGF0ZSgwIDEyMCkgcm90YXRlKDEzNSkgc2NhbGUoMTIzLjI1KSI+CjxzdG9wIHN0b3AtY29sb3I9IiNGRjU2MzAiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRkY1NjMwIiBzdG9wLW9wYWNpdHk9IjAiLz4KPC9yYWRpYWxHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K')",
            backgroundSize: "50%, 50%",
            backgroundRepeat: "no-repeat",
            backdropFilter: "blur(20px)",
            backgroundPosition: "right top, left bottom"
          }
        }}
      >
        <Box
          sx={{
            width: 400,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}
          role="presentation"
        >
          <Box sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 2
          }}>
            <Typography fontSize={18} fontWeight={600} variant="h6">
              Configurações
            </Typography>
            <IconButton
              aria-label="close"
              onClick={toggleDrawer("right", false)}
            >
              <IoClose />
            </IconButton>
          </Box>
          <Box
            style={{
              overflowY: "auto",
              height: 200,
              flex: 1,
              padding: "16px",
              paddingTop: 0,
              display: "flex",
              flexDirection: "column",
              gap: "32px"
            }}
          >
            <Box sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
            }}>
              <Button 
                sx={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  borderRadius: "16px",
                  gap: 2,
                  padding: 2,
                  borderColor: "divider",
                  borderWidth: 1,
                  borderStyle: "solid",
                  backgroundColor: "transparent",
                  flex: 1,
                  color: theme.palette.mode === "dark" ? "white" : "#444444"
                }}
                variant="outlined"
                onClick={() => handleChangeMode(mode === "dark" ? "light" : "dark")}
              >
                <Box 
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 1,
                    width: "100%",
                  }}
                >
                  <IconlyMooncloudy 
                    size={26}
                  />
                  <Switch 
                    checked={mode === "dark"}
                    size="small"
                    color="primary"
                    onChange={(event) => handleChangeMode(event.target.checked ? "dark" : "light")}
                  />
                </Box>
                <Typography 
                  fontSize={12} 
                  fontWeight={600}
                >
                  Modo Escuro
                </Typography>
              </Button>
              <Button 
                sx={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  borderRadius: "16px",
                  gap: 2,
                  padding: 2,
                  borderColor: "divider",
                  borderWidth: 1,
                  borderStyle: "solid",
                  backgroundColor: "transparent",
                  flex: 1,
                  color: theme.palette.mode === "dark" ? "white" : "#333333"
                }}
                variant="outlined"
                onClick={() => handleChangeContrast(null as any, contrast === "positive" ? "negative" : "positive")}
              >
                <Box 
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 1,
                    width: "100%",
                  }}
                >
                  <IconlyMask 
                    size={26}
                  />
                  <Switch 
                    checked={contrast === "positive"}
                    size="small"
                    color="primary"
                    onChange={(event) => handleChangeContrast(null as any, event.target.checked ? "positive" : "negative")}
                  />
                </Box>
                <Typography 
                  fontSize={12} 
                  fontWeight={600}
                >
                  Contraste
                </Typography>
              </Button>  
            </Box>

            <Box>
              <Typography
                fontSize={14}
                variant="h6"
                sx={{ marginBottom: 2 }}
                fontWeight={600}
              >
                Barra de Navegação
              </Typography>
              <ToggleButtonGroup
                color="primary"
                value={layout}
                exclusive
                onChange={handleChangeLayout}
                sx={{
                  gap: 2,
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "start",
                  "& 	.Mui-selected": {
                    backgroundColor: "transparent"
                  }
                }}
              >
                <ToggleButton
                  value="compact"
                  size="small"
                  selected={layout === "compact"}
                  sx={{
                    borderRadius: "16px !important",
                    backgroundColor: "transparent !important",
                    border: "none !important",
                  }}
                >
                  <Box 
                    sx={{
                      borderRadius: "12px",
                      boxShadow: layout === "compact" ? "-8px 8px 20px -4px rgba(0, 0, 0, 0.12)" : "none",
                      backgroundColor: theme.palette.background.paper,
                      border: "1px solid rgba(145, 158, 171, 0.12)"
                    }}
                  >
                    <svg width="86" height="64" viewBox="0 0 86 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_4351_51578)">
                      <mask id="path-2-inside-1_4351_51578" fill="white">
                      <path d="M0 0H22V64H0V0Z"/>
                      </mask>
                      <path d="M21 0V64H23V0H21Z" fill="currentColor" fillOpacity="0.08" mask="url(#path-2-inside-1_4351_51578)"/>
                        <circle opacity="0.8" cx="11" cy="11" r="5" fill="currentColor"/>
                        <rect opacity="0.48" x="6" y="20" width="10" height="4" rx="2" fill="currentColor"/>
                        <rect opacity="0.24" x="6" y="28" width="10" height="4" rx="2" fill="currentColor"/>
                        <rect opacity="0.2" x="26" y="4" width="56" height="56" rx="8" fill="currentColor"/>
                      </g>
                      <defs>
                        <clipPath id="clip0_4351_51578">
                          <path d="M0 12C0 5.37258 5.37258 0 12 0H74C80.6274 0 86 5.37258 86 12V52C86 58.6274 80.6274 64 74 64H12C5.37258 64 0 58.6274 0 52V12Z" fill="white"/>
                        </clipPath>
                      </defs>
                    </svg>
                  </Box>
                </ToggleButton>
                <ToggleButton
                  value="expanded"
                  size="small"
                  selected={layout === "expanded"}
                  sx={{
                    borderRadius: "16px !important",
                    backgroundColor: "transparent !important",
                    border: "none !important",
                  }}
                >
                  <Box 
                    sx={{
                      borderRadius: "12px",
                      boxShadow: layout === "expanded" ? "-8px 8px 20px -4px rgba(0, 0, 0, 0.12)" : "none",
                      backgroundColor: theme.palette.background.paper,
                      border: "1px solid rgba(145, 158, 171, 0.12)"
                    }}
                  >
                    <svg width="86" height="64" viewBox="0 0 86 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_4351_51580)">
                        <mask id="path-2-inside-1_4351_51580" fill="white">
                        <path d="M0 0H32V64H0V0Z"/>
                        </mask>
                        <path d="M31 0V64H33V0H31Z" fill="currentColor" fillOpacity="0.08" mask="url(#path-2-inside-1_4351_51580)"/>
                        <circle opacity="0.8" cx="11" cy="11" r="5" fill="currentColor"/>
                        <rect opacity="0.48" x="6" y="20" width="20" height="4" rx="2" fill="currentColor"/>
                        <rect opacity="0.24" x="6" y="28" width="14" height="4" rx="2" fill="currentColor"/>
                        <rect opacity="0.2" x="36" y="4" width="46" height="56" rx="8" fill="currentColor"/>
                      </g>
                      <defs>
                        <clipPath id="clip0_4351_51580">
                        <path d="M0 12C0 5.37258 5.37258 0 12 0H74C80.6274 0 86 5.37258 86 12V52C86 58.6274 80.6274 64 74 64H12C5.37258 64 0 58.6274 0 52V12Z" fill="white"/>
                        </clipPath>
                      </defs>
                    </svg>
                  </Box>
                </ToggleButton>
                <ToggleButton
                  value="stacked"
                  size="small"
                  selected={layout === "stacked"}
                  sx={{
                    borderRadius: "16px !important",
                    backgroundColor: "transparent !important",
                    border: "none !important",
                  }}
                >
                  <Box 
                    sx={{
                      borderRadius: "12px",
                      boxShadow: layout === "stacked" ? "-8px 8px 20px -4px rgba(0, 0, 0, 0.12)" : "none",
                      backgroundColor: theme.palette.background.paper,
                      border: "1px solid rgba(145, 158, 171, 0.12)"
                    }}
                  >
                    <svg 
                      className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-cllw2t" 
                      focusable="false"  
                      viewBox="0 0 86 64" 
                      width="86" 
                      height="64" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clipPath="url(#clip0_1153_596)">
                        <mask id="path-2-inside-1_1153_596" fill="white">
                          <path d="M0 0H86V22H0V0Z"></path>
                        </mask>
                        <path d="M86 21H0V23H86V21Z" fill="currentColor" fillOpacity="0.08" mask="url(#path-2-inside-1_1153_596)"></path>
                        <circle opacity="0.8" cx="11" cy="11" r="5" fill="currentColor"></circle>
                        <rect opacity="0.48" x="20" y="9" width="16" height="4" rx="2" fill="currentColor"></rect>
                        <rect opacity="0.24" x="40" y="9" width="10" height="4" rx="2" fill="currentColor"></rect>
                        <rect opacity="0.2" x="4" y="26" width="78" height="34" rx="8" fill="currentColor"></rect>\
                      </g>
                      <defs>
                        <clipPath id="clip0_1153_596">
                          <path d="M0 12C0 5.37258 5.37258 0 12 0H74C80.6274 0 86 5.37258 86 12V52C86 58.6274 80.6274 64 74 64H12C5.37258 64 0 58.6274 0 52V12Z" fill="white"></path>
                        </clipPath>
                      </defs>
                    </svg>
                  </Box>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box>
              <Typography
                fontSize={14}
                variant="h6"
                sx={{ marginBottom: 2 }}
                fontWeight={600}
              >
                Cor da Barra de Navegação
              </Typography>
              <ToggleButtonGroup
                color="primary"
                value={color}
                exclusive
                onChange={handleChangeColor}
                sx={{
                  gap: 2,
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "start",
                  "& 	.Mui-selected": {
                    backgroundColor: "transparent"
                  }
                }}
              >
                <ToggleButton
                  value="integrate"
                  size="small"
                  selected={color === "integrate"}
                  sx={{
                    borderRadius: "16px !important",
                    backgroundColor: "transparent !important",
                    border: "none !important",
                    flex: 1,
                  }}
                >
                  <Box 
                    sx={{
                      borderRadius: "12px",
                      boxShadow: color === "integrate" ? "-8px 8px 20px -4px rgba(0, 0, 0, 0.12)" : "none",
                      backgroundColor: theme.palette.background.paper,
                      border: "1px solid rgba(145, 158, 171, 0.12)",
                      flex: 1,
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      padding: 2,
                      gap: 2,
                    }}
                  >
                    <svg 
                      className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-ia94qz" 
                      focusable="false" 
                      viewBox="0 0 24 24" 
                      width="24" 
                      height="24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path fillRule="evenodd" clipRule="evenodd" d="M14.557 2.25C16.395 2.25 17.851 2.25 18.99 2.403C20.162 2.561 21.111 2.893 21.86 3.641C22.608 4.39 22.94 5.339 23.098 6.511C23.251 7.651 23.251 9.106 23.251 10.944V13.056C23.251 14.894 23.251 16.35 23.098 17.489C22.94 18.661 22.608 19.61 21.86 20.359C21.111 21.107 20.162 21.439 18.99 21.597C17.85 21.75 16.395 21.75 14.557 21.75H9.53498C9.51097 21.7508 9.48695 21.7505 9.46298 21.749C8.07898 21.745 6.93998 21.722 6.01198 21.597C4.83998 21.439 3.89098 21.107 3.14198 20.359C2.39398 19.61 2.06198 18.661 1.90398 17.489C1.75098 16.349 1.75098 14.894 1.75098 13.056V10.944C1.75098 9.106 1.75098 7.65 1.90398 6.511C2.06198 5.339 2.39398 4.39 3.14198 3.641C3.89098 2.893 4.83998 2.561 6.01198 2.403C6.93998 2.278 8.07898 2.255 9.46198 2.251C9.4863 2.24984 9.51066 2.24984 9.53498 2.251L10.445 2.25H14.557ZM10.251 3.75H14.501C16.408 3.75 17.762 3.752 18.791 3.89C19.796 4.025 20.376 4.279 20.799 4.702C21.222 5.125 21.476 5.705 21.611 6.711C21.749 7.739 21.751 9.093 21.751 11V13C21.751 14.907 21.749 16.262 21.611 17.29C21.476 18.295 21.222 18.875 20.799 19.298C20.376 19.721 19.796 19.975 18.79 20.11C17.762 20.248 16.408 20.25 14.501 20.25H10.251V3.75ZM8.75098 20.244C7.71698 20.234 6.89298 20.202 6.21098 20.11C5.20598 19.975 4.62598 19.721 4.20298 19.298C3.77998 18.875 3.52598 18.295 3.39098 17.289C3.25298 16.262 3.25098 14.907 3.25098 13V11C3.25098 9.093 3.25298 7.739 3.39098 6.71C3.52598 5.705 3.77998 5.125 4.20298 4.702C4.62598 4.279 5.20598 4.025 6.21198 3.89C6.89198 3.798 7.71698 3.767 8.75098 3.756V20.244Z" fill="currentColor"></path><path d="M4.49991 9C4.49991 8.58579 4.8357 8.25 5.24991 8.25H6.74991C7.16412 8.25 7.49991 8.58579 7.49991 9C7.49991 9.41421 7.16412 9.75 6.74991 9.75H5.24991C4.8357 9.75 4.49991 9.41421 4.49991 9Z" fill="currentColor"></path><path d="M4.49991 12C4.49991 11.5858 4.8357 11.25 5.24991 11.25H6.74991C7.16412 11.25 7.49991 11.5858 7.49991 12C7.49991 12.4142 7.16412 12.75 6.74991 12.75H5.24991C4.8357 12.75 4.49991 12.4142 4.49991 12Z" fill="currentColor"></path><path d="M4.49991 15C4.49991 14.5858 4.8357 14.25 5.24991 14.25H6.74991C7.16412 14.25 7.49991 14.5858 7.49991 15C7.49991 15.4142 7.16412 15.75 6.74991 15.75H5.24991C4.8357 15.75 4.49991 15.4142 4.49991 15Z" fill="currentColor"></path>
                    </svg>
                    <Typography
                      fontSize={12}
                      variant="h6"
                      fontWeight={600}
                    >
                      Integrada
                    </Typography>
                  </Box>
                </ToggleButton>
                <ToggleButton
                  value="apparent"
                  size="small"
                  selected={color === "apparent"}
                  sx={{
                    borderRadius: "16px !important",
                    backgroundColor: "transparent !important",
                    border: "none !important",
                    flex: 1,
                  }}
                >
                  <Box 
                    sx={{
                      borderRadius: "12px",
                      boxShadow: color === "apparent" ? "-8px 8px 20px -4px rgba(0, 0, 0, 0.12)" : "none",
                      backgroundColor: theme.palette.background.paper,
                      border: "1px solid rgba(145, 158, 171, 0.12)",
                      flex: 1,
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      padding: 2,
                      gap: 2,
                    }}
                  >
                    <svg 
                      className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-ia94qz" focusable="false" viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M18.99 2.403C17.851 2.25 16.395 2.25 14.557 2.25H10.445L9.53498 2.251C9.51066 2.24984 9.4863 2.24984 9.46198 2.251C8.07898 2.255 6.93998 2.278 6.01198 2.403C4.83998 2.561 3.89098 2.893 3.14198 3.641C2.39398 4.39 2.06198 5.339 1.90398 6.511C1.75098 7.65 1.75098 9.106 1.75098 10.944V13.056C1.75098 14.894 1.75098 16.349 1.90398 17.489C2.06198 18.661 2.39398 19.61 3.14198 20.359C3.89098 21.107 4.83998 21.439 6.01198 21.597C6.93998 21.722 8.07898 21.745 9.46298 21.749C9.48695 21.7505 9.51097 21.7508 9.53498 21.75H14.557C16.395 21.75 17.85 21.75 18.99 21.597C20.162 21.439 21.111 21.107 21.86 20.359C22.608 19.61 22.94 18.661 23.098 17.489C23.251 16.35 23.251 14.894 23.251 13.056V10.944C23.251 9.106 23.251 7.651 23.098 6.511C22.94 5.339 22.608 4.39 21.86 3.641C21.111 2.893 20.162 2.561 18.99 2.403ZM14.501 3.75H10.251V20.25H14.501C16.408 20.25 17.762 20.248 18.79 20.11C19.796 19.975 20.376 19.721 20.799 19.298C21.222 18.875 21.476 18.295 21.611 17.29C21.749 16.262 21.751 14.907 21.751 13V11C21.751 9.093 21.749 7.739 21.611 6.711C21.476 5.705 21.222 5.125 20.799 4.702C20.376 4.279 19.796 4.025 18.791 3.89C17.762 3.752 16.408 3.75 14.501 3.75ZM4.49993 9C4.49993 8.58579 4.83571 8.25 5.24993 8.25H6.74993C7.16414 8.25 7.49993 8.58579 7.49993 9C7.49993 9.41421 7.16414 9.75 6.74993 9.75H5.24993C4.83571 9.75 4.49993 9.41421 4.49993 9ZM4.49993 12C4.49993 11.5858 4.83571 11.25 5.24993 11.25H6.74993C7.16414 11.25 7.49993 11.5858 7.49993 12C7.49993 12.4142 7.16414 12.75 6.74993 12.75H5.24993C4.83571 12.75 4.49993 12.4142 4.49993 12ZM5.24993 14.25C4.83571 14.25 4.49993 14.5858 4.49993 15C4.49993 15.4142 4.83571 15.75 5.24993 15.75H6.74993C7.16414 15.75 7.49993 15.4142 7.49993 15C7.49993 14.5858 7.16414 14.25 6.74993 14.25H5.24993Z" fill="currentColor"></path>
                    </svg>
                    <Typography
                      fontSize={12}
                      variant="h6"
                      fontWeight={600}
                    >
                      Aparente
                    </Typography>
                  </Box>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>


            <Box>
              <Typography
                fontSize={14}
                variant="h6"
                sx={{ marginBottom: 2 }}
                fontWeight={600}
              >
                Compacto
              </Typography>
              <Button
                sx={{
                  width: "100%",
                  border: "1px solid rgba(145, 158, 171, 0.12)",
                  backgroundColor: theme => theme.palette.mode === "light" ? "rgb(244, 246, 248)" : "rgba(145, 158, 171, 0.16)",
                  borderRadius: "10px",
                  padding: "16px"
                }}
                onClick={() => handleChangeCompact(compact === "small" ? "large" : "small")}
              >
                <Box sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingLeft: "8px",
                  paddingRight: "8px",
                  marginLeft: "auto",
                  marginRight: "auto",
                  width: compact === "small" ? "50%" : "100%",
                  height: "40px",
                  borderRadius: "8px",
                  color: "rgb(99, 115, 129)",
                  backgroundColor: "background.paper",
                  boxShadow: "rgb(145 158 171 / 16%) 0px 12px 24px -4px",
                  transition: "width 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                }}>
                  {compact === "large" ? <IoChevronBack /> : <IoChevronForward />}
                  {compact === "large" ? <IoChevronForward /> : <IoChevronBack />}
                </Box>
              </Button>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </>
  )
}