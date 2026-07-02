"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Alert, Box } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { MainCard } from "@repo/design_system/app/organisms/cards/MainCard";
import { ReportLoadingState } from "./ReportStates";
import {
  ReportCardActionsMenu,
  ReportDateFilterDialog,
  ReportDocumentationDrawer,
  ReportDrillDownDialog,
  ReportFeedbackDialog,
  reportActionIcons,
  type ReportActionDateRange,
  type ReportCardActionItem,
  type ReportCardActionsConfig,
  type ReportModuleId,
  type ReportPageId,
} from "./actions";
import { getDefaultReportDateRange } from "./dateRange";

type ReportCardShellProps = {
  cardHeight?: number;
  children: ReactNode;
  contentHeight?: number;
  error?: string | null;
  loading?: boolean;
  onDatesChange?: (dates: [string, string]) => void;
  reportActions?: ReportCardActionsConfig;
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
  reportActions,
  scrollable = false,
  subtitle,
  title,
}: ReportCardShellProps) {
  const { user } = useUser();
  const pathname = usePathname();
  const [documentationOpen, setDocumentationOpen] = useState(false);
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [localDateRange, setLocalDateRange] = useState<ReportActionDateRange | null>(null);

  const effectiveActions = useMemo<ReportCardActionsConfig>(() => {
    const derivedModule = getModuleFromPathname(pathname);
    const derivedPage = getPageFromPathname(pathname);
    const defaultDateRange = getDefaultReportDateRange();
    const effectiveDateRange = localDateRange || reportActions?.dateRange || {
      displayLabel: defaultDateRange.displayLabel,
      endDateIso: defaultDateRange.endDateIso,
      intervalDates: defaultDateRange.intervalDates,
      startDateIso: defaultDateRange.startDateIso,
    };
    const cardId = reportActions?.cardId || slugify(title);
    const cardTitle = reportActions?.cardTitle || title;

    return {
      cardId,
      cardTitle,
      dateRange: effectiveDateRange,
      documentation: reportActions?.documentation || {
        title,
        description: "Documentação inicial preparada para este cartão.",
        dataSource: "API OpenLDR.",
        limitations: "A documentação completa será expandida nas próximas fases.",
      },
      drillDown: reportActions?.drillDown || {
        cardId,
        chartType: "card",
        dateRange: effectiveDateRange,
        module: reportActions?.module || derivedModule,
        page: reportActions?.page || derivedPage,
      },
      drillDownDescription: reportActions?.drillDownDescription || "Selecione uma barra, ponto ou item do gráfico para ver detalhes.",
      drillDownRows: reportActions?.drillDownRows,
      drillDownTitle: reportActions?.drillDownTitle || `Detalhes - ${cardTitle}`,
      enableDateFilter: reportActions?.enableDateFilter ?? true,
      enableFeedback: reportActions?.enableFeedback ?? true,
      module: reportActions?.module || derivedModule,
      onDrillDownOpen: reportActions?.onDrillDownOpen,
      page: reportActions?.page || derivedPage,
    };
  }, [localDateRange, pathname, reportActions, title]);
  const effectiveDateRange = effectiveActions.dateRange;

  const actionOptions = useMemo<ReportCardActionItem[]>(() => {
    const actions: ReportCardActionItem[] = [];
    if (effectiveActions.drillDown) {
      actions.push({
        icon: reportActionIcons.drillDown,
        label: "Ver detalhes",
        onSelect: () => {
          if (effectiveActions.onDrillDownOpen) {
            effectiveActions.onDrillDownOpen();
            return;
          }
          setDrillDownOpen(true);
        },
      });
    }
    if (effectiveActions.enableDateFilter) {
      actions.push({
        icon: reportActionIcons.dateFilter,
        label: "Filtrar período",
        onSelect: () => setDateFilterOpen(true),
      });
    }
    if (effectiveActions.documentation) {
      actions.push({
        icon: reportActionIcons.documentation,
        label: "Ver documentação",
        onSelect: () => setDocumentationOpen(true),
      });
    }
    if (effectiveActions.enableFeedback) {
      actions.push({
        icon: reportActionIcons.feedback,
        label: "Dúvidas e sugestões",
        onSelect: () => setFeedbackOpen(true),
      });
    }

    return actions;
  }, [effectiveActions]);

  const handleDateFilterApply = (range: ReportActionDateRange) => {
    setLocalDateRange(range);
    onDatesChange?.([range.startDateIso, range.endDateIso]);
  };

  const subtitleLabel = localDateRange?.displayLabel || subtitle;

  return (
    <Box sx={{ position: "relative", width: "100%" }}>
      <MainCard
        additionalOptions={[]}
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
        disableDefaultCardActions
        handleSubmit={onDatesChange}
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
        loading={false}
        reportType={undefined}
        subtitle={subtitleLabel}
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
      <Box sx={{ position: "absolute", right: { sm: 18, xs: 12 }, top: { sm: 12, xs: 10 }, zIndex: 3 }}>
        <ReportCardActionsMenu actions={actionOptions} />
      </Box>
      <ReportDocumentationDrawer
        documentation={effectiveActions.documentation}
        onClose={() => setDocumentationOpen(false)}
        open={documentationOpen}
      />
      <ReportDateFilterDialog
        currentRange={effectiveDateRange}
        onApply={handleDateFilterApply}
        onClose={() => setDateFilterOpen(false)}
        open={dateFilterOpen}
      />
      <ReportFeedbackDialog
        cardId={effectiveActions.cardId}
        cardTitle={effectiveActions.cardTitle}
        currentPage={pathname}
        module={effectiveActions.module}
        onClose={() => setFeedbackOpen(false)}
        open={feedbackOpen}
        user={{
          email: user?.emailAddresses[0]?.emailAddress,
          name: user?.fullName || undefined,
        }}
      />
      <ReportDrillDownDialog
        context={effectiveActions.drillDown}
        description={effectiveActions.drillDownDescription}
        onClose={() => setDrillDownOpen(false)}
        open={drillDownOpen}
        rows={effectiveActions.drillDownRows}
        title={effectiveActions.drillDownTitle || `Detalhes - ${effectiveActions.cardTitle}`}
      />
    </Box>
  );
}

function getModuleFromPathname(pathname: string): ReportModuleId {
  if (pathname.startsWith("/dpi")) return "dpi";
  if (pathname.startsWith("/viral-load")) return "viral-load";
  return "tb";
}

function getPageFromPathname(pathname: string): ReportPageId {
  if (pathname.endsWith("/clinic")) return "clinic";
  if (pathname.endsWith("/lab")) return "lab";
  if (pathname.endsWith("/patients")) return "patients";
  return "summary";
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
