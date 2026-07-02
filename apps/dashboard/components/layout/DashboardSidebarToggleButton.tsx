"use client";

import { IconButton, Tooltip } from "@mui/material";
import { Menu } from "lucide-react";
import type { SettingsProps } from "@repo/design_system/app/molecules/headers/SettingsDrawer";

type DashboardSidebarToggleButtonProps = {
  onToggle: (settings: SettingsProps) => void;
  settings: SettingsProps;
};

export function DashboardSidebarToggleButton({ onToggle, settings }: DashboardSidebarToggleButtonProps) {
  const isExpanded = settings.layout === "expanded";
  const label = isExpanded ? "Recolher menu lateral" : "Expandir menu lateral";
  const tooltip = isExpanded ? "Recolher menu" : "Expandir menu";

  return (
    <Tooltip arrow title={tooltip}>
      <IconButton
        aria-label={label}
        onClick={() =>
          onToggle({
            ...settings,
            layout: isExpanded ? "compact" : "expanded",
          })
        }
        size="small"
        sx={{
          border: "1px solid",
          borderColor: "divider",
          color: "text.primary",
          flexShrink: 0,
          height: 36,
          width: 36,
          "&:hover": {
            bgcolor: "action.hover",
          },
          "&.Mui-focusVisible": {
            outline: "2px solid",
            outlineColor: "primary.main",
            outlineOffset: 2,
          },
        }}
      >
        <Menu aria-hidden size={20} strokeWidth={2.2} />
      </IconButton>
    </Tooltip>
  );
}
