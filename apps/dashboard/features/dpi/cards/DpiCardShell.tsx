"use client";

import type { ReactNode } from "react";
import { Alert, Box, Typography } from "@mui/material";
import { MainCard } from "@repo/design_system/app/organisms/cards/MainCard";
import { VscDebugRestart } from "react-icons/vsc";
import type { DpiDateInterval } from "../types/summary";
import { formatDpiDateInterval } from "../api/summary";

type DpiCardShellProps = {
  children: ReactNode;
  error?: string | null;
  interval: DpiDateInterval;
  loading?: boolean;
  minHeight?: number;
  onIntervalChange: (interval: DpiDateInterval) => void;
  onRestart?: () => void;
  title: string;
};

const dpiUser = {
  email: "openldr@ins.gov.mz",
  name: "OpenLDR",
};

export function DpiCardShell({
  children,
  error,
  interval,
  loading,
  minHeight = 340,
  onIntervalChange,
  onRestart,
  title,
}: DpiCardShellProps) {
  return (
    <MainCard
      additionalOptions={
        onRestart
          ? [
              {
                action: onRestart,
                icon: <VscDebugRestart size={18} />,
                label: "Reiniciar relatório",
                type: "primary",
              },
            ]
          : []
      }
      bodyProps={{ sx: { px: 2, pb: 2, minHeight } }}
      disableDefaultCardActions
      handleSubmit={(dates) => onIntervalChange({ startDate: dates[0], endDate: dates[1] })}
      height="auto"
      loading={loading}
      reportType={undefined}
      subtitle={formatDpiDateInterval(interval)}
      title={title}
      user={dpiUser}
      width="100%"
    >
      {error ? (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : (
        children
      )}
    </MainCard>
  );
}

export function EmptyDpiState() {
  return (
    <Box
      sx={{
        alignItems: "center",
        color: "text.secondary",
        display: "flex",
        justifyContent: "center",
        minHeight: 220,
        textAlign: "center",
      }}
    >
      <Typography fontSize={14} fontWeight={700}>
        Sem dados disponíveis para o período selecionado.
      </Typography>
    </Box>
  );
}
