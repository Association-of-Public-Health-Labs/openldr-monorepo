"use client";

import type { ReactNode } from "react";
import { Box } from "@mui/material";
import { ReportCardShell, ReportEmptyState } from "../../../shared/reporting";
import type { ReportCardActionsConfig } from "../../../shared/reporting";
import type { ViralLoadDateInterval } from "../../types/common";
import { formatViralLoadInterval } from "../../types/common";

type ViralLoadCardShellProps = {
  cardHeight?: number;
  children: ReactNode;
  contentHeight?: number;
  error?: string | null;
  interval: ViralLoadDateInterval;
  loading?: boolean;
  onIntervalChange: (interval: ViralLoadDateInterval) => void;
  reportActions?: ReportCardActionsConfig;
  scrollable?: boolean;
  title: string;
};

export function ViralLoadCardShell({
  cardHeight = 440,
  children,
  contentHeight = 320,
  error,
  interval,
  loading,
  onIntervalChange,
  reportActions,
  scrollable = false,
  title,
}: ViralLoadCardShellProps) {
  return (
    <ReportCardShell
      cardHeight={cardHeight}
      contentHeight={contentHeight}
      error={error}
      loading={loading}
      onDatesChange={(dates) => onIntervalChange({ startDate: dates[0], endDate: dates[1] })}
      reportActions={reportActions}
      scrollable={scrollable}
      subtitle={formatViralLoadInterval(interval)}
      title={title}
    >
      {children}
    </ReportCardShell>
  );
}

export function ViralLoadChartFrame({
  children,
  height = 280,
}: {
  children: ReactNode;
  height?: number;
}) {
  return (
    <Box
      sx={{
        flex: 1,
        height,
        maxHeight: 360,
        minHeight: 240,
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      {children}
    </Box>
  );
}

export function EmptyViralLoadState({ minHeight = 260 }: { minHeight?: number }) {
  return <ReportEmptyState minHeight={minHeight} />;
}
