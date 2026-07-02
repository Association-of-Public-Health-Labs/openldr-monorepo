"use client";

import { Button } from "@mui/material";
import { reportActionIcons } from "./reportActionIcons";

type ReportDrillDownActionProps = {
  disabled?: boolean;
  onClick: () => void;
};

export function ReportDrillDownAction({ disabled, onClick }: ReportDrillDownActionProps) {
  return (
    <Button disabled={disabled} onClick={onClick} startIcon={reportActionIcons.drillDown} variant="outlined">
      Ver detalhes
    </Button>
  );
}
