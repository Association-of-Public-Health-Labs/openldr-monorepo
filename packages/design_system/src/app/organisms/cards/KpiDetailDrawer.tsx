"use client";

import { useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { cn } from "../../../lib/utils";
import { exportSheet, type ExcelSheet } from "../../../lib/report/export/excel";
import type { KpiFigure } from "../../../lib/report/kpi-detail";
import { KpiBars } from "../../atoms/charts/apex/KpiBars";
import { OVERLINE } from "../../molecules/metrics/SummaryStrip";
import { KpiFigureGrid } from "./KpiFigureGrid";
import { KpiTrendLine, type KpiTrend } from "./KpiCard";

const TEXT = "text-[#1C252E] dark:text-white";
const MUTED = "text-[#637381] dark:text-[#919EAB]";
const HAIRLINE = "border-[rgba(145,158,171,0.2)]";
const CHART_HEIGHT = 260;

export type KpiDetailDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  icon?: ReactNode;
  color: string;
  /** Under the title ("Últimos 12 meses"). */
  period: string;
  /** The period in full, for the Excel subtitle ("28 de outubro de 2025 à 28 de outubro de 2026"). */
  exportSubtitle: string;
  value: ReactNode;
  trend?: KpiTrend | null;
  /** The summary strip (`kpiFigures`). */
  figures: KpiFigure[];
  /** The tile's bars, drawn larger with axes. */
  bars: { labels: string[]; data: number[]; format: (value: number) => string; highlight?: number; min?: number };
  /** "Sobre o indicador" (`kpiDocs`). */
  docs: string[];
  /** The Excel sheet (`kpiSheet`), built on click. */
  sheet: () => ExcelSheet;
  id?: string;
};

/**
 * Right-hand drawer with a KPI tile's details: the headline and trend, a strip of figures, the
 * monthly bars with axes, what the indicator counts, and an Excel export. Uses the tile's data only.
 */
export function KpiDetailDrawer(props: KpiDetailDrawerProps) {
  const { open, onOpenChange, title, icon, color, period, exportSubtitle, value, trend, figures, bars, docs, sheet, id } = props;
  const [exportError, setExportError] = useState<string | null>(null);

  const onExport = () => {
    try {
      setExportError(null);
      exportSheet(title, exportSubtitle, sheet());
    } catch {
      setExportError("Não foi possível exportar para Excel.");
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) setExportError(null);
        onOpenChange(next);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[1200] bg-[rgba(28,37,46,0.24)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content
          id={id}
          tabIndex={-1}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            (event.currentTarget as HTMLElement | null)?.focus();
          }}
          className="fixed inset-y-0 right-0 z-[1200] flex h-full w-[420px] max-w-full flex-col bg-white/95 shadow-[-40px_40px_80px_-8px_rgba(145,158,171,0.24)] outline-none backdrop-blur-[20px] data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right dark:bg-[#141A21]/95 dark:shadow-[-40px_40px_80px_-8px_rgba(0,0,0,0.24)]"
        >
          <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-4">
            <div className="flex min-w-0 items-center gap-3">
              {icon && (
                <span
                  aria-hidden
                  className="flex size-9 shrink-0 items-center justify-center rounded-[10px] [&_svg]:size-[18px]"
                  style={{ color, backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` }}
                >
                  {icon}
                </span>
              )}
              <div className="min-w-0">
                <Dialog.Title className={cn("truncate text-lg leading-7 font-semibold", TEXT)}>{title}</Dialog.Title>
                <Dialog.Description className={cn("truncate text-sm", MUTED)}>{period}</Dialog.Description>
              </div>
            </div>
            <Dialog.Close aria-label="Fechar" className="rounded-full p-2 text-[#637381] hover:bg-[rgba(145,158,171,0.08)] dark:text-[#919EAB]">
              <X className="size-5" />
            </Dialog.Close>
          </div>

          {/* Vertical scroll only: nothing in the drawer may push it sideways. */}
          <div className={cn("flex min-w-0 flex-1 flex-col gap-6 overflow-x-hidden overflow-y-auto border-t border-dashed px-5 pt-5 pb-6", HAIRLINE)}>
            <div className="min-w-0">
              <p className={cn("text-[32px] leading-[40px] font-bold tracking-tight break-words tabular-nums", TEXT)}>{value}</p>
              {trend && <KpiTrendLine trend={trend} />}
            </div>

            <KpiFigureGrid figures={figures} />

            {/* Full drawer width, no negative margin; the scroll area clips any pixel ApexCharts draws over (tooltips stay visible). */}
            <section aria-label={`${title} por mês`} className="w-full min-w-0">
              <KpiBars
                id={id ? `${id}-chart` : undefined}
                labels={bars.labels}
                data={bars.data}
                color={color}
                format={bars.format}
                highlight={bars.highlight}
                min={bars.min}
                height={CHART_HEIGHT}
                showAxes
              />
            </section>

            <section className={cn("flex flex-col gap-2 border-t border-dashed pt-5", HAIRLINE)}>
              <h3 className={OVERLINE}>Sobre o indicador</h3>
              {docs.map((sentence) => (
                <p key={sentence} className={cn("text-sm leading-[22px]", MUTED)}>
                  {sentence}
                </p>
              ))}
            </section>
          </div>

          <div className={cn("flex flex-col gap-2 border-t px-5 py-4", HAIRLINE)}>
            {exportError && (
              <p role="alert" className="text-xs text-red-500">
                {exportError}
              </p>
            )}
            <button
              type="button"
              onClick={onExport}
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#1C252E] px-4 text-sm font-bold text-white transition-colors hover:bg-[#454F5B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] dark:bg-white dark:text-[#1C252E] dark:hover:bg-[#C4CDD5]"
            >
              <PiMicrosoftExcelLogoFill aria-hidden className="size-5" />
              Exportar para Excel
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
