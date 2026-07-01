"use client";

import type { ReactNode } from "react";
import { Alert, Box } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useUser } from "@clerk/nextjs";
import { MainCard } from "@repo/design_system/app/organisms/cards/MainCard";
import { ReportLoadingState } from "./ReportStates";

type ReportCardShellProps = {
  cardHeight?: number;
  children: ReactNode;
  contentHeight?: number;
  error?: string | null;
  loading?: boolean;
  onDatesChange?: (dates: [string, string]) => void;
  scrollable?: boolean;
  subtitle: string;
  title: string;
};

export function ReportCardShell({
  cardHeight = 440,
  children,
  contentHeight = 320,
  error,
  loading,
  onDatesChange,
  scrollable = false,
  subtitle,
  title,
}: ReportCardShellProps) {
  const { user } = useUser();

  return (
    <MainCard
      bodyProps={{
        sx: {
          display: "flex",
          flex: 1,
          flexDirection: "column",
          minHeight: 0,
          overflow: scrollable ? "auto" : "hidden",
          px: { sm: 2.75, xs: 2 },
          pb: { sm: 2.6, xs: 2 },
          pt: 0.5,
          scrollbarColor: "rgba(120, 120, 120, 0.55) transparent",
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar": {
            height: 8,
            width: 7,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(120, 120, 120, 0.45)",
            borderRadius: 999,
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
        },
      }}
      containerProps={{
        sx: {
          bgcolor: "background.paper",
          height: { md: cardHeight, xs: "auto" },
          minHeight: { md: cardHeight, xs: 380 },
          minWidth: 0,
          transition: "border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease",
          width: "100%",
          "@media (prefers-reduced-motion: no-preference)": {
            "&:hover": {
              borderColor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.28 : 0.22),
              boxShadow: 2,
            },
          },
        },
      }}
      headerProps={{
        sx: {
          px: { sm: 2.75, xs: 2 },
          pt: { sm: 1.6, xs: 1.35 },
          "& > .MuiBox-root": {
            alignItems: "flex-start",
            pb: 0.75,
            pt: 0,
          },
          "& h5": {
            fontSize: { sm: "1.08rem", xs: "1rem" },
            fontWeight: 800,
            letterSpacing: 0,
            lineHeight: 1.25,
          },
          "& h6": {
            fontSize: "0.73rem",
            fontWeight: 700,
            lineHeight: 1.2,
          },
          "& button": {
            p: 0.75,
          },
        },
      }}
      handleSubmit={onDatesChange}
      loading={false}
      reportType={onDatesChange ? "national" : undefined}
      subtitle={subtitle}
      title={title}
      user={{
        avatar: user?.imageUrl,
        email: user?.emailAddresses[0]?.emailAddress || "openldr@ins.gov.mz",
        name: user?.fullName || "OpenLDR",
      }}
      width="100%"
    >
      <Box
        sx={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          minHeight: { md: contentHeight, xs: 300 },
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        {loading ? (
          <ReportLoadingState minHeight={contentHeight} />
        ) : error ? (
          <Alert severity="warning" sx={{ mt: 1 }}>
            {error}
          </Alert>
        ) : (
          children
        )}
      </Box>
    </MainCard>
  );
}
