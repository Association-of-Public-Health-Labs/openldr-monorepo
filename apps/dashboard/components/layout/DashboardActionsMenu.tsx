"use client";

import { useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Box, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import { usePathname } from "next/navigation";
import {
  ReportDocumentationDrawer,
  ReportFeedbackDialog,
  reportActionIcons,
  type ReportDocumentation,
  type ReportModuleId,
} from "@/features/shared/reporting";

type DashboardActionsMenuProps = {
  title: string;
};

export function DashboardActionsMenu({ title }: DashboardActionsMenuProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [documentationOpen, setDocumentationOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const open = Boolean(anchorEl);

  const moduleId = useMemo<ReportModuleId>(() => {
    if (pathname.startsWith("/dpi")) return "dpi";
    if (pathname.startsWith("/viral-load")) return "viral-load";
    return "tb";
  }, [pathname]);

  const documentation = useMemo<ReportDocumentation>(
    () => ({
      title,
      description: "Dashboard do módulo com cartões, filtros e indicadores operacionais do OpenLDR.",
      dataSource: "API OpenLDR.",
      interpretation: "Use os cartões para acompanhar volumes, tendências, rankings e estados dos dados no período selecionado.",
      limitations: "Alguns drill-downs e filtros avançados serão ligados faseadamente nas próximas fases.",
    }),
    [title],
  );

  const handleCloseMenu = () => setAnchorEl(null);

  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
      <IconButton
        aria-controls={open ? "dashboard-actions-menu" : undefined}
        aria-expanded={open ? "true" : undefined}
        aria-haspopup="menu"
        aria-label="Ações da dashboard"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        size="small"
      >
        {reportActionIcons.menu}
      </IconButton>
      <Menu anchorEl={anchorEl} id="dashboard-actions-menu" onClose={handleCloseMenu} open={open}>
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            setDocumentationOpen(true);
          }}
        >
          {reportActionIcons.documentation}
          <Typography sx={{ ml: 1 }}>Documentação da dashboard</Typography>
        </MenuItem>
        <MenuItem disabled>
          {reportActionIcons.dateFilter}
          <Typography sx={{ ml: 1 }}>Filtros do módulo</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            setFeedbackOpen(true);
          }}
        >
          {reportActionIcons.feedback}
          <Typography sx={{ ml: 1 }}>Dúvidas e sugestões</Typography>
        </MenuItem>
      </Menu>
      <ReportDocumentationDrawer documentation={documentation} onClose={() => setDocumentationOpen(false)} open={documentationOpen} />
      <ReportFeedbackDialog
        cardId={`${moduleId}-dashboard`}
        cardTitle={title}
        currentPage={pathname}
        module={moduleId}
        onClose={() => setFeedbackOpen(false)}
        open={feedbackOpen}
        user={{
          email: user?.emailAddresses[0]?.emailAddress,
          name: user?.fullName || undefined,
        }}
      />
    </Box>
  );
}
