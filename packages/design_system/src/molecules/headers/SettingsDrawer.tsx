import React, { MouseEvent, KeyboardEvent, useState } from "react";
import {
  IconButton,
  Box,
  Drawer,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  SvgIcon,
  Button
} from "@mui/material";
import { IoOptionsOutline, IoClose, IoChevronBack, IoChevronForward, IoContrastSharp } from "react-icons/io5";
import { TbContrast } from "react-icons/tb";
import { MdModeNight, MdLightMode } from "react-icons/md";
import hexToRgba from "hex-to-rgba";
import ScrollBar from "react-perfect-scrollbar";

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
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [direction, setDirection] = useState<"row" | "column">("column");
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
    event: MouseEvent<HTMLElement>,
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

  // const handleChangeLanguage = (
  //   event: MouseEvent<HTMLElement>,
  //   language: "pt" | "en",
  // ) => {
  //   setLanguage(language);
  //   handleSetAppSettings({ ...settings, lang: language });
  //   push(pathname, pathname, { locale: language })
  // };

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
          height: "80%",
          "& .MuiBackdrop-root": {
            backgroundColor: "transparent"
          },
          "& .MuiPaper-root.MuiPaper-elevation": {
            backdropFilter: "blur(6px)",
            backgroundColor: theme => hexToRgba(theme.palette.background.paper, "0.92"),
            borderRadius: "12px",
            height: "80%",
            top: "10%",
            boxShadow: 2
          }
        }}
      >
        <Box
          sx={{
            width: 300,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}
          role="presentation"
        >
          <Box sx={{
            borderBottom: "1px dashed rgba(145, 158, 171, 0.24)",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 2
          }}>
            <Typography fontSize={18} variant="h6">
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
              padding: "16px"
            }}
          >
            <Box sx={{ marginBottom: "25px" }}>
              <Typography
                fontSize={14}
                variant="h6"
                sx={{ marginBottom: 2 }}
              >
                Tema
              </Typography>
              <ToggleButtonGroup
                color="primary"
                value={settings?.mode}
                exclusive
                onChange={handleChangeMode}
                sx={{
                  gap: 2,
                  "& 	.Mui-selected": {
                    border: theme => `3px solid ${theme.palette.primary.main} !important`,
                    backgroundColor: "transparent"
                  }
                }}
              >
                <ToggleButton
                  value="light"
                  size="large"
                  selected={settings?.mode === "light"}
                  sx={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "12px !important",
                    boxShadow: "rgb(145 158 171 / 16%) 0px 20px 40px -4px",
                    border: "1px solid rgba(145, 158, 171, 0.12) !important",
                  }}
                >
                  <MdLightMode fontSize={26} />
                </ToggleButton>
                <ToggleButton
                  value="dark"
                  size="large"
                  selected={settings?.mode === "dark"}
                  sx={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "12px !important",
                    boxShadow: "rgb(145 158 171 / 16%) 0px 20px 40px -4px",
                    border: "1px solid rgba(145, 158, 171, 0.12) !important",
                    backgroundColor: (theme) => theme.palette.grey[800] + " !important",
                    color: "white",
                  }}
                >
                  <MdModeNight fontSize={26} />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Box sx={{ marginBottom: "25px" }}>
              <Typography
                fontSize={14}
                variant="h6"
                sx={{ marginBottom: 2 }}
              >
                Barra de Navegação
              </Typography>
              <ToggleButtonGroup
                color="primary"
                value={settings?.sidebar}
                exclusive
                onChange={handleChangeDirection}
                sx={{
                  gap: 2,
                  "& 	.Mui-selected": {
                    border: theme => `3px solid ${theme.palette.primary.main} !important`,
                    backgroundColor: "transparent"
                  }
                }}
              >
                <ToggleButton
                  value="column"
                  size="large"
                  selected={settings?.sidebar === "column"}
                  sx={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "12px !important",
                    boxShadow: "rgb(145 158 171 / 16%) 0px 20px 40px -4px",
                    border: "1px solid rgba(145, 158, 171, 0.12) !important",
                    backgroundColor: (theme) => theme.palette.background.paper + " !important",
                  }}
                >
                  <SvgIcon viewBox="0 0 27 30">
                    <svg width="27" height="30" viewBox="0 0 27 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="27" height="19" rx="3" fill="#D9D9D9" />
                      <rect y="21.7422" width="26.5195" height="7.26192" rx="2" fill="#D9D9D9" />
                    </svg>
                  </SvgIcon>
                </ToggleButton>
                <ToggleButton
                  value="row"
                  size="large"
                  selected={settings?.sidebar === "row"}
                  sx={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "12px !important",
                    boxShadow: "rgb(145 158 171 / 16%) 0px 20px 40px -4px",
                    border: "1px solid rgba(145, 158, 171, 0.12) !important",
                    backgroundColor: (theme) => theme.palette.background.paper + " !important",
                  }}
                >
                  <SvgIcon viewBox="0 0 58 23">
                    <svg width="58" height="23" viewBox="0 0 58 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="27" height="23" rx="3" fill="#D9D9D9" />
                      <rect x="31" y="8" width="26.5195" height="7.26192" rx="2" fill="#D9D9D9" />
                    </svg>
                  </SvgIcon>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box sx={{ marginBottom: "25px" }}>
              <Typography
                fontSize={14}
                variant="h6"
                sx={{ marginBottom: 2 }}
              >
                Língua
              </Typography>
              <ToggleButtonGroup
                color="primary"
                value={settings?.lang}
                exclusive
                onChange={() => {}}
                sx={{
                  gap: 2,
                  "& 	.Mui-selected": {
                    border: theme => `3px solid ${theme.palette.primary.main} !important`,
                    backgroundColor: "transparent"
                  }
                }}
              >
                <ToggleButton
                  value="pt"
                  size="large"
                  selected={settings?.lang === "pt"}
                  sx={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "12px !important",
                    boxShadow: "rgb(145 158 171 / 16%) 0px 20px 40px -4px",
                    border: "1px solid rgba(145, 158, 171, 0.12) !important",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    backgroundColor: (theme) => theme.palette.background.paper + " !important",
                  }}
                >
                  <img style={{ width: "25px" }} src="https://purecatamphetamine.github.io/country-flag-icons/3x2/MZ.svg" />
                  <Typography fontSize={12}>Português</Typography>
                </ToggleButton>
                <ToggleButton
                  value="en"
                  size="large"
                  selected={settings?.lang === "en"}
                  sx={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "12px !important",
                    boxShadow: "rgb(145 158 171 / 16%) 0px 20px 40px -4px",
                    border: "1px solid rgba(145, 158, 171, 0.12) !important",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    backgroundColor: (theme) => theme.palette.background.paper + " !important",
                  }}
                >
                  <img style={{ width: "25px" }} src="https://purecatamphetamine.github.io/country-flag-icons/3x2/GB.svg" />
                  <Typography fontSize={12}>English</Typography>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box sx={{ marginBottom: "25px" }}>
              <Typography
                fontSize={14}
                variant="h6"
                sx={{ marginBottom: 2 }}
              >
                Contraste
              </Typography>
              <ToggleButtonGroup
                color="primary"
                value={settings?.contrast}
                exclusive
                onChange={handleChangeContrast}
                sx={{
                  gap: 2,
                  "& 	.Mui-selected": {
                    // border: theme => `3px solid ${theme.palette.primary.main} !important`,
                    backgroundColor: "transparent"
                  }
                }}
              >
                <ToggleButton
                  value="negative"
                  size="large"
                  selected={settings?.contrast === "negative"}
                  sx={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "12px !important",
                    boxShadow: "rgb(145 158 171 / 16%) 0px 20px 40px -4px",
                    border: "1px solid rgba(145, 158, 171, 0.12) !important",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    backgroundColor: (theme) => theme.palette.background.paper + " !important",
                  }}
                >
                  <IoContrastSharp fontSize={26} />
                </ToggleButton>
                <ToggleButton
                  value="positive"
                  size="large"
                  selected={settings?.contrast === "positive"}
                  sx={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "12px !important",
                    boxShadow: "rgb(145 158 171 / 16%) 0px 20px 40px -4px",
                    border: "1px solid rgba(145, 158, 171, 0.12) !important",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    backgroundColor: (theme) => theme.palette.background.paper + " !important",
                  }}
                >
                  <TbContrast fontSize={26} />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box sx={{ marginBottom: "25px" }}>
              <Typography
                fontSize={14}
                variant="h6"
                sx={{ marginBottom: 2 }}
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