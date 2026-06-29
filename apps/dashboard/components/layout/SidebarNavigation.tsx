"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import { ChevronDown, ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Logo } from "@repo/design_system_mui/atoms/images/Logo";
import { isNavigationNodeActive, navigationItems, type NavigationChild, type NavigationNode } from "../../config/navigation";

const apparentSidebarColors = {
  bg: "#141a21",
  border: "#32323C",
  hover: "rgba(255,255,255,0.08)",
  muted: "rgba(255,255,255,0.62)",
  panel: "#1d232a",
  text: "#fff",
};

const integratedSidebarColors = {
  bg: "background.paper",
  border: "divider",
  hover: "action.hover",
  muted: "text.secondary",
  panel: "background.default",
  text: "text.primary",
};

type SidebarPalette = typeof apparentSidebarColors;

type SidebarNavigationProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  navigationColor: "integrate" | "apparent";
  onCloseMobile: () => void;
  onToggleCollapsed: () => void;
  width: number;
};

export function SidebarNavigation({
  collapsed,
  mobileOpen,
  navigationColor,
  onCloseMobile,
  onToggleCollapsed,
  width,
}: SidebarNavigationProps) {
  const pathname = usePathname();
  const sidebarColors = navigationColor === "apparent" ? apparentSidebarColors : integratedSidebarColors;
  const activeGroup = useMemo(
    () => navigationItems.find((item) => item.children && isNavigationNodeActive(item, pathname))?.label,
    [pathname],
  );
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (activeGroup) {
      setOpenGroups((current) => ({ ...current, [activeGroup]: true }));
    }
  }, [activeGroup]);

  const renderContent = (isCollapsed: boolean) => (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: sidebarColors.bg,
        color: sidebarColors.text,
      }}
    >
      <Box
        sx={{
          px: isCollapsed ? 1 : 2,
          py: 2.5,
          minHeight: 84,
          display: "flex",
          alignItems: "center",
          justifyContent: isCollapsed ? "center" : "space-between",
          gap: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
          <Logo width={38} />
          {!isCollapsed && (
            <Box sx={{ minWidth: 0 }}>
              <Typography fontSize={15} fontWeight={900} lineHeight={1.2} noWrap>
                OpenLDR
              </Typography>
              <Typography color={sidebarColors.muted} fontSize={12} fontWeight={700} noWrap>
                Dashboard Unificada
              </Typography>
            </Box>
          )}
        </Box>
        {!isCollapsed && (
          <IconButton
            aria-label="Recolher navegação"
            onClick={onToggleCollapsed}
            size="small"
            sx={{ color: sidebarColors.muted, display: { xs: "none", md: "inline-flex" } }}
          >
            <PanelLeftClose size={18} />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ borderColor: sidebarColors.border }} />

      {isCollapsed ? (
        <CompactNavigation
          colors={sidebarColors}
          pathname={pathname}
          onToggleCollapsed={onToggleCollapsed}
          onCloseMobile={onCloseMobile}
        />
      ) : (
        <ExpandedNavigation
          colors={sidebarColors}
          onCloseMobile={onCloseMobile}
          onToggleGroup={(label) => setOpenGroups((current) => ({ ...current, [label]: !current[label] }))}
          openGroups={openGroups}
          pathname={pathname}
        />
      )}
    </Box>
  );

  return (
    <>
      <Drawer
        ModalProps={{ keepMounted: true }}
        onClose={onCloseMobile}
        open={mobileOpen}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: 286,
            borderRight: "1px solid",
            borderColor: sidebarColors.border,
            bgcolor: sidebarColors.bg,
          },
        }}
        variant="temporary"
      >
        {renderContent(false)}
      </Drawer>
      <Drawer
        open
        sx={{
          display: { xs: "none", md: "block" },
          width,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width,
            overflowX: "hidden",
            borderRight: "1px solid",
            borderColor: sidebarColors.border,
            bgcolor: sidebarColors.bg,
            transition: "width 180ms ease",
          },
        }}
        variant="permanent"
      >
        {renderContent(collapsed)}
      </Drawer>
    </>
  );
}

function CompactNavigation({
  colors,
  onCloseMobile,
  onToggleCollapsed,
  pathname,
}: {
  colors: SidebarPalette;
  onCloseMobile: () => void;
  onToggleCollapsed: () => void;
  pathname: string;
}) {
  return (
    <Box sx={{ flex: 1, overflow: "hidden", px: 1, py: 1.5 }}>
      <List component="nav" disablePadding sx={{ display: "grid", gap: 0.75 }}>
        {navigationItems.map((item) => {
          const active = isNavigationNodeActive(item, pathname);
          const href = item.href ?? item.basePath ?? "#";
          const button = (
            <ListItemButton
              LinkComponent={Link}
              href={href}
              onClick={onCloseMobile}
              selected={active}
              sx={navigationButtonSx(active, true, colors)}
            >
              <ListItemIcon sx={navigationIconSx(active, true, colors)}>{item.icon}</ListItemIcon>
            </ListItemButton>
          );

          return (
            <Tooltip key={item.label} placement="right" title={item.label}>
              {button}
            </Tooltip>
          );
        })}
      </List>
      <Box sx={{ mt: 1.25 }}>
        <Tooltip placement="right" title="Expandir navegação">
          <IconButton
            aria-label="Expandir navegação"
            onClick={onToggleCollapsed}
            sx={{
              width: "100%",
              height: 44,
              borderRadius: 1.5,
              color: colors.muted,
              "&:hover": { bgcolor: colors.hover },
            }}
          >
            <PanelLeftOpen size={18} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

function ExpandedNavigation({
  colors,
  onCloseMobile,
  onToggleGroup,
  openGroups,
  pathname,
}: {
  colors: SidebarPalette;
  onCloseMobile: () => void;
  onToggleGroup: (label: string) => void;
  openGroups: Record<string, boolean>;
  pathname: string;
}) {
  return (
    <List
      component="nav"
      sx={{
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        px: 1.5,
        py: 1.5,
        scrollbarWidth: "thin",
      }}
    >
      {navigationItems.map((item) => (
        <Fragment key={item.label}>
          {item.children ? (
            <GroupedNavigationItem
              item={item}
              colors={colors}
              onCloseMobile={onCloseMobile}
              onToggle={() => onToggleGroup(item.label)}
              open={Boolean(openGroups[item.label])}
              pathname={pathname}
            />
          ) : (
            <SingleNavigationItem colors={colors} item={item} onCloseMobile={onCloseMobile} pathname={pathname} />
          )}
        </Fragment>
      ))}
    </List>
  );
}

function SingleNavigationItem({
  colors,
  item,
  onCloseMobile,
  pathname,
}: {
  colors: SidebarPalette;
  item: NavigationNode;
  onCloseMobile: () => void;
  pathname: string;
}) {
  const active = item.href === pathname;

  return (
    <ListItemButton
      LinkComponent={Link}
      href={item.href ?? "#"}
      onClick={onCloseMobile}
      selected={active}
      sx={navigationButtonSx(active, false, colors)}
    >
      <ListItemIcon sx={navigationIconSx(active, false, colors)}>{item.icon}</ListItemIcon>
      <ListItemText
        primary={item.label}
        primaryTypographyProps={{ fontSize: 13, fontWeight: 900, noWrap: true }}
      />
    </ListItemButton>
  );
}

function GroupedNavigationItem({
  colors,
  item,
  onCloseMobile,
  onToggle,
  open,
  pathname,
}: {
  colors: SidebarPalette;
  item: NavigationNode;
  onCloseMobile: () => void;
  onToggle: () => void;
  open: boolean;
  pathname: string;
}) {
  const active = isNavigationNodeActive(item, pathname);

  return (
    <Box sx={{ mb: 0.75 }}>
      <ListItemButton onClick={onToggle} selected={active} sx={navigationButtonSx(active, false, colors)}>
        <ListItemIcon sx={navigationIconSx(active, false, colors)}>{item.icon}</ListItemIcon>
        <ListItemText
          primary={item.label}
          primaryTypographyProps={{ fontSize: 13, fontWeight: 900, noWrap: true }}
        />
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </ListItemButton>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List disablePadding sx={{ mt: 0.5, ml: 1.25 }}>
          {item.children?.map((child) => (
            <ChildNavigationItem
              child={child}
              colors={colors}
              key={child.href}
              onCloseMobile={onCloseMobile}
              pathname={pathname}
            />
          ))}
        </List>
      </Collapse>
    </Box>
  );
}

function ChildNavigationItem({
  child,
  colors,
  onCloseMobile,
  pathname,
}: {
  child: NavigationChild;
  colors: SidebarPalette;
  onCloseMobile: () => void;
  pathname: string;
}) {
  const active = pathname === child.href;

  return (
    <ListItemButton
      LinkComponent={Link}
      href={child.href}
      onClick={onCloseMobile}
      selected={active}
      sx={{
        minHeight: 34,
        borderRadius: 1.25,
        pl: 4.75,
        pr: 1,
        mb: 0.25,
        color: active ? "primary.main" : colors.muted,
        "&.Mui-selected": {
          bgcolor: "rgba(0,176,0,0.12)",
          color: "primary.main",
        },
        "&:hover": {
          bgcolor: colors.hover,
        },
      }}
    >
      <ListItemText
        primary={child.label}
        primaryTypographyProps={{
          fontSize: 12.5,
          fontWeight: active ? 900 : 700,
          noWrap: true,
        }}
      />
    </ListItemButton>
  );
}

function navigationButtonSx(active: boolean, compact: boolean, colors: SidebarPalette) {
  return {
    minHeight: 44,
    borderRadius: 1.5,
    justifyContent: compact ? "center" : "flex-start",
    px: compact ? 0 : 1.25,
    mb: 0.25,
    color: active ? "primary.main" : colors.muted,
    "&.Mui-selected": {
      bgcolor: "rgba(0,176,0,0.14)",
      color: "primary.main",
    },
    "&.Mui-selected:hover": {
      bgcolor: "rgba(0,176,0,0.18)",
    },
    "&:hover": {
      bgcolor: colors.hover,
    },
  };
}

function navigationIconSx(active: boolean, compact: boolean, colors: SidebarPalette) {
  return {
    minWidth: compact ? 0 : 34,
    color: active ? "primary.main" : colors.muted,
    display: "grid",
    placeItems: "center",
  };
}
