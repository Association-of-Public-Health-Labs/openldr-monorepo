"use client";
import React, { ReactNode } from "react";
import { Box, useTheme } from "@mui/material";
import hexToRgba from "hex-to-rgba";
import { Logo } from "../atoms/images/Logo";
import { Text } from "../atoms/typography/Text";
import { MainOptions, OptionsProps } from "../molecules/sidebar/MainOptions";
import { MainHeader } from "../organisms/headers/MainHeader"
import { UserProps } from "../molecules/headers/UserNavigation";
import { SettingsProps } from "../molecules/headers/SettingsDrawer";

const SIDEBAR_WIDTH_COLLAPSED = 88;
const SIDEBAR_WIDTH_EXPANDED = 300;
const HEADER_HEIGHT = 129;
const PADDING_X_LARGE = 16;
const PADDING_X_SMALL = 4;

type Option = {
  label: string;
  icon: React.ReactNode;
  action: () => void;
  active: boolean;
}

interface Props {
  children: ReactNode;
  options: OptionsProps[]
  pagename?: string;
  handleOpenSettingsModal?: () => void
  handleSetAppSettings?: (settings: SettingsProps) => void
  settings?: SettingsProps
  user?: UserProps
  aiChatIsOpen?: boolean
}

export function DashboardLayout({
  children,
  pagename,
  options,
  handleOpenSettingsModal,
  handleSetAppSettings,
  settings,
  user,
  aiChatIsOpen=true
}: Props) {
  const theme = useTheme();
  
  // Sidebar color styles
  const sidebarBg = settings?.color === "apparent" ? "#141a21" : theme.palette.background.paper;
  const sidebarText = settings?.color === "apparent" ? "#fff" : "inherit";
  const sidebarSecondaryBg = settings?.color === "apparent" ? "#1d232a" : theme.palette.background.paper;
  const sidebarBorder = settings?.color === "apparent" ? "#32323C" : theme.palette.divider;

  const paddingXAiChat = generatePaddingX(aiChatIsOpen, settings);

  return (
    <Box
      sx={{
        position: "absolute",
        display: "flex",
        width: "100%",
        height: "100%",
        flexDirection: settings?.layout === "stacked" ? "column" : "row",
        overflow: "hidden",
      }}
    >
      {/* Sidebar (Not Stacked) */}
      {settings?.layout !== "stacked" && (
        <Box
          sx={{
            width: settings?.layout === "expanded" ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED,
            transition: "width 0.2s",
            overflowX: "hidden",
            boxSizing: "border-box",
            bgcolor: sidebarBg,
            color: sidebarText,
            borderRight: "1px solid",
            borderColor: sidebarBorder,
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingY: 4,
            paddingX: settings?.layout === "expanded" ? 2 : 0.5,
            gap: 4,
          }}
        >
          <Logo width={40} />
          <MainOptions 
            color="primary"
            variant={settings?.layout === "expanded" ? "row" : "column"}
            options={options}
            navigationColor={settings?.color}
          />
        </Box>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          bgcolor: settings?.contrast === "positive" ? "background.default" : "background.paper",
          position: "relative",
          height: "100vh",
          containerType: "inline-size",
          overflow: "hidden",
        }}
      >
        
        <Box
          sx={{
            position: "relative",
            height: "100%",
            paddingBottom: 4,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {settings?.layout === "stacked" && (
            <Box
              sx={{
                position: "sticky", 
                top: 0,
                left: 0,
                width: "100vw",
                height: HEADER_HEIGHT,
                borderBottom: "1px solid",
                borderColor: "divider",
                zIndex: 1100,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                color: sidebarText,
                bgcolor: sidebarBg,
              }}
            >
              <Box 
                sx={{
                  width: "100%",
                  borderBottom: "1px dashed",
                  borderColor: sidebarBorder,
                  height: 64,
                  display: "flex",
                  alignItems: "center",
                  ...(paddingXAiChat),
                  gap: 2,
                }}
              >
                <MainHeader
                  handleOpenSettingsModal={handleOpenSettingsModal}
                  handleSetAppSettings={handleSetAppSettings}
                  settings={settings}
                  user={user}
                  sx={{
                    paddingRight: settings?.compact === "large" ? PADDING_X_LARGE : PADDING_X_SMALL,
                    top: 0,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Logo width={40} />
                    <Box 
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "left",
                      }}
                    >
                      <Text 
                        sx={{ 
                          fontSize: 14, 
                          fontWeight: "bold" 
                        }}
                      >
                        Portal de Tuberculose
                      </Text>
                      <Text 
                        sx={{ fontSize: 13, fontWeight: 600 }}
                      >
                        Ministério da Saúde
                      </Text>
                    </Box>
                  </Box>
                </MainHeader>
              </Box>
              <Box 
                sx={{
                  width: "100%",
                  bgcolor: sidebarSecondaryBg,
                  height: 64,
                  display: "flex",
                  justifyContent: "start",
                  alignItems: "center",
                  ...(paddingXAiChat),
                }}
              >
                <MainOptions 
                  color="primary"
                  variant="row"
                  options={options}
                  stacked={false}
                  navigationColor={settings?.color}
                />
              </Box>
            </Box>
          )}
          
          {settings?.layout !== "stacked" && (
            <MainHeader
              handleOpenSettingsModal={handleOpenSettingsModal}
              handleSetAppSettings={handleSetAppSettings}
              settings={settings}
              user={user}
              sx={{
                paddingX: settings?.compact === "large" ? PADDING_X_LARGE : PADDING_X_SMALL,
                position: "sticky",
                top: 0,
                left: 0,  
                right: 0,
                zIndex: 1100,
                width: "100%",
                backgroundColor: hexToRgba(settings?.contrast === "positive" ? theme.palette.background.default : theme.palette.background.paper, 0.4),
                backdropFilter: "blur(8px)",
              }}
            >
              <Text 
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  color: theme => theme.palette.text.primary,
                  fontSize: {
                    xs: '1rem', // ~18px
                    sm: '1.125rem',  // ~20px
                    md: '1.25rem',   // ~24px
                    lg: '1.375rem',     // ~32px
                    xl: '1.5rem',     // ~32px
                  }
                }}
              >
                {pagename}
              </Text>
            </MainHeader>
          )}

          <Box 
            sx={{
              paddingX: settings?.compact === "large" ? PADDING_X_LARGE : PADDING_X_SMALL,
              paddingTop: settings?.layout === "stacked" ? "29px" : "0px",
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function generatePaddingX(isAiChatOpen: boolean, settings: SettingsProps) {
  // if (settings?.layout === "stacked") return 0;
  if (isAiChatOpen) {
    if(settings?.layout === "stacked") {
      return {
        paddingLeft: settings?.compact === "large" ? PADDING_X_LARGE : PADDING_X_SMALL,
        paddingRight: 0,
      }
    }
    else if(settings?.layout === "compact") {
      return {
        paddingLeft: settings?.compact === "large" ? PADDING_X_LARGE : PADDING_X_SMALL,
        paddingRight: 0,
      }
    }
    else if(settings?.layout === "expanded") {
      return {
        paddingLeft: settings?.compact === "large" ? PADDING_X_LARGE : PADDING_X_SMALL,
        paddingRight: 0,
      }
    }
  };
  return {
    paddingX: settings?.compact === "large" ? PADDING_X_LARGE : PADDING_X_SMALL
  };
}