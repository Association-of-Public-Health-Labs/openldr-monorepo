"use client";
import React, { ReactNode } from "react";
import { Box, useTheme } from "@mui/material";
import {Logo} from "../atoms/images/Logo";
import {Text} from "../atoms/typography/Text";
import {MainOptions, OptionsProps} from "../molecules/sidebar/MainOptions";
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
  // expanded: boolean;
  options: OptionsProps[]
  pagename?: string;
  // stacked?: boolean;
  // color?: "integrate" | "apparent"
  handleOpenSettingsModal?: () => void
  handleSetAppSettings?: (settings: SettingsProps) => void
  settings?: SettingsProps
  user?: UserProps
}

export function DashboardLayout({
  children,
  pagename,
  // expanded,
  options,
  // stacked = false,
  // color = "integrate",
  handleOpenSettingsModal,
  handleSetAppSettings,
  settings,
  user
}: Props) {
  const theme = useTheme();

  // Sidebar color styles
  const sidebarBg = settings?.color === "apparent" ? "#141a21" : theme.palette.background.paper;
  const sidebarText = settings?.color === "apparent" ? "#fff" : "inherit";
  const sidebarSecondaryBg = settings?.color === "apparent" ? "#1d232a" : theme.palette.background.paper;
  const sidebarBorder = settings?.color === "apparent" ? "#32323C" : theme.palette.divider;

  const paddingX = settings?.compact === "large" ? PADDING_X_LARGE : PADDING_X_SMALL;

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        flexDirection: settings?.layout === "stacked" ? "column" : "row",
      }}
    >
      {/* Header (Stacked Layout) */}
      {settings?.layout === "stacked" && (
        <Box
          sx={{
            position: "fixed",
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
              paddingX: paddingX,
              gap: 2,
            }}
          >
            <MainHeader
              handleOpenSettingsModal={handleOpenSettingsModal}
              handleSetAppSettings={handleSetAppSettings}
              settings={settings}
              user={user}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Logo width={50} />
                <Box 
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "left",
                  }}
                >
                  <Text 
                    sx={{ 
                      fontSize: 18, 
                      fontWeight: "bold" 
                    }}
                  >
                    Portal de Tuberculose
                  </Text>
                  <Text 
                    sx={{ fontSize: 16, fontWeight: 400 }}
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
              paddingX: paddingX,
            }}
          >
            <MainOptions 
              color="primary"
              variant="row"
              options={options}
              stacked={false}
            />
          </Box>
        </Box>
      )}

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
          <Logo width={50} />
          <MainOptions 
            color="primary"
            variant={settings?.layout === "expanded" ? "row" : "column"}
            options={options}
          />
        </Box>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.paper",
          height: "100vh",
          overflow: "auto",
          ...(settings?.layout === "stacked" && {
            pt: `${HEADER_HEIGHT}px`, // Add top padding to clear the fixed header
          }),
          paddingX: paddingX,
        }}
      >
        {settings?.layout !== "stacked" && (
          <MainHeader
            handleOpenSettingsModal={handleOpenSettingsModal}
            handleSetAppSettings={handleSetAppSettings}
            settings={settings}
            user={user}
          >
            <Text 
              variant="h5"
              sx={{
                fontWeight: "600",
                color: theme => theme.palette.text.primary
              }}
            >
              {pagename}
            </Text>
          </MainHeader>
        )}
        {children}
      </Box>
    </Box>
  );
}