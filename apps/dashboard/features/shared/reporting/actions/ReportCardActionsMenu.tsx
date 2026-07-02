"use client";

import type { MainCardHeaderOptions } from "@repo/design_system/app/molecules/cards/MainCardHeader";
import { Box, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import type { ReactNode } from "react";
import { useState } from "react";
import { reportActionIcons } from "./reportActionIcons";

export type ReportCardActionItem = {
  disabled?: boolean;
  icon: ReactNode;
  label: string;
  onSelect: () => void;
};

export function toMainCardHeaderOptions(actions: ReportCardActionItem[]): MainCardHeaderOptions[] {
  return actions.map((action) => ({
    action: action.onSelect,
    disabled: action.disabled,
    icon: action.icon,
    label: action.label,
    type: "secondary",
  }));
}

type ReportCardActionsMenuProps = {
  actions: ReportCardActionItem[];
  label?: string;
};

export function ReportCardActionsMenu({ actions, label = "Ações do relatório" }: ReportCardActionsMenuProps) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  if (!actions.length) return null;

  return (
    <Box>
      <IconButton
        aria-controls={open ? "report-card-actions-menu" : undefined}
        aria-expanded={open ? "true" : undefined}
        aria-haspopup="menu"
        aria-label={label}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        size="small"
        sx={{
          bgcolor: open ? "action.selected" : "transparent",
          borderRadius: 1.25,
          color: "text.secondary",
          transition: "background-color 160ms ease, color 160ms ease",
          "&:hover": {
            bgcolor: "action.hover",
            color: "text.primary",
          },
        }}
      >
        {reportActionIcons.menu}
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        id="report-card-actions-menu"
        onClose={() => setAnchorEl(null)}
        open={open}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        slotProps={{
          paper: {
            sx: {
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1.5,
              boxShadow: theme.shadows[6],
              minWidth: 224,
              overflow: "visible",
              zIndex: theme.zIndex.modal + 2,
            },
          },
        }}
      >
        {actions.map((action) => (
          <MenuItem
            disabled={action.disabled}
            key={action.label}
            onClick={() => {
              setAnchorEl(null);
              action.onSelect();
            }}
            sx={{
              borderRadius: 1,
              gap: 1,
              mx: 0.75,
              my: 0.25,
              px: 1.2,
              py: 1,
              transition: "background-color 140ms ease",
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.14 : 0.08),
              },
              "& svg": {
                color: "text.secondary",
              },
            }}
          >
            {action.icon}
            <Typography fontSize={13.5} fontWeight={750} noWrap>
              {action.label}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
