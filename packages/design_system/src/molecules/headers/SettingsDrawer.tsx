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
import { IconlyMooncloudy } from "../../atoms/icons/IconlyMooncloudy";
import { IconlyMask } from "../../atoms/icons/IconlyMask";

export const SettingsDrawerStep = {
  selector: "settings-drawer",
  content: "Neste butão tens as configurações da aplicação, nomeadamente: o Tema, a orientação da Barra de Navegação, a Língua, o Contraste e o Layout da Página"
}

type Anchor = "top" | "left" | "bottom" | "right";

export type SettingsDrawerProps = {
  settings: any
  handleSetAppSettings: (settings: any) => void
}

export function SettingsDrawer({settings, handleSetAppSettings}: SettingsDrawerProps) {
  const theme = useTheme();
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [direction, setDirection] = useState<"row" | "column">(settings?.sidebar || "column");
  const [language, setLanguage] = useState<"pt" | "en">("pt");
  const [layout, setLayout] = useState<"small" | "large">("large");
  const [contrast, setContrast] = useState<"positive" | "negative">("negative");
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
    setMode(mode);
    handleSetAppSettings({ ...settings, mode: mode });
  };

  const handleChangeDirection = (
    event: MouseEvent<HTMLElement>,
    direction: "column" | "row",
  ) => {
    setDirection(direction);
    handleSetAppSettings({ ...settings, sidebar: direction });
  };

  const handleChangeContrast = (
    event: MouseEvent<HTMLElement>,
    contrast: "negative" | "positive",
  ) => {
    setContrast(contrast);
    handleSetAppSettings({ ...settings, contrast: contrast });
  };

  const handleChangeLayout = (layout: "small" | "large") => {
    setLayout(layout);
    handleSetAppSettings({ ...settings, layout: layout });
  };

  return (
    <>
      <IconButton
        className={SettingsDrawerStep.selector}
        aria-label="settings"
        size="medium"
        onClick={toggleDrawer("right", true)}
      >
        <IoOptionsOutline />
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
                value={direction}
                exclusive
                onChange={handleChangeDirection}
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
                  value="column"
                  size="small"
                  selected={direction === "column"}
                  sx={{
                    borderRadius: "16px !important",
                    backgroundColor: "transparent !important",
                    border: "none !important",
                  }}
                >
                  <Box 
                    sx={{
                      borderRadius: "12px",
                      boxShadow: direction === "column" ? "-8px 8px 20px -4px rgba(0, 0, 0, 0.12)" : "none",
                      backgroundColor: theme.palette.background.paper,
                      border: "1px solid rgba(145, 158, 171, 0.12)"
                    }}
                  >
                    <svg width="86" height="64" viewBox="0 0 86 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clip-path="url(#clip0_4351_51578)">
                      <mask id="path-2-inside-1_4351_51578" fill="white">
                      <path d="M0 0H22V64H0V0Z"/>
                      </mask>
                      <path d="M21 0V64H23V0H21Z" fill="currentColor" fill-opacity="0.08" mask="url(#path-2-inside-1_4351_51578)"/>
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
                  value="row"
                  size="small"
                  selected={direction === "row"}
                  sx={{
                    borderRadius: "16px !important",
                    backgroundColor: "transparent !important",
                    border: "none !important",
                  }}
                >
                  <Box 
                    sx={{
                      borderRadius: "12px",
                      boxShadow: direction === "row" ? "-8px 8px 20px -4px rgba(0, 0, 0, 0.12)" : "none",
                      backgroundColor: theme.palette.background.paper,
                      border: "1px solid rgba(145, 158, 171, 0.12)"
                    }}
                  >
                    <svg width="86" height="64" viewBox="0 0 86 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clip-path="url(#clip0_4351_51580)">
                        <mask id="path-2-inside-1_4351_51580" fill="white">
                        <path d="M0 0H32V64H0V0Z"/>
                        </mask>
                        <path d="M31 0V64H33V0H31Z" fill="currentColor" fill-opacity="0.08" mask="url(#path-2-inside-1_4351_51580)"/>
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
              </ToggleButtonGroup>
            </Box>

            <Box>
              <Typography
                fontSize={14}
                variant="h6"
                sx={{ marginBottom: 2 }}
                fontWeight={600}
              >
                Layout
              </Typography>
              <Button
                sx={{
                  width: "100%",
                  border: "1px solid rgba(145, 158, 171, 0.12)",
                  backgroundColor: theme => theme.palette.mode === "light" ? "rgb(244, 246, 248)" : "rgba(145, 158, 171, 0.16)",
                  borderRadius: "10px",
                  padding: "16px"
                }}
                onClick={() => handleChangeLayout(settings?.layout === "small" ? "large" : "small")}
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
                  width: layout === "small" ? "50%" : "100%",
                  height: "40px",
                  borderRadius: "8px",
                  color: "rgb(99, 115, 129)",
                  backgroundColor: "background.paper",
                  boxShadow: "rgb(145 158 171 / 16%) 0px 12px 24px -4px",
                  transition: "width 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                }}>
                  {layout === "large" ? <IoChevronBack /> : <IoChevronForward />}
                  {layout === "large" ? <IoChevronForward /> : <IoChevronBack />}
                </Box>
              </Button>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </>
  )
}