"use client";

import { useMemo, useState } from "react";
import { MainCard } from "../../../app/organisms/cards/MainCard";
import type { MainCardHeaderOptions } from "../../../app/molecules/cards/MainCardHeader";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { IoImageOutline } from "react-icons/io5";
import { VscDebugRestart } from "react-icons/vsc";
import { MdOutlineScience } from "react-icons/md";
import { exportSheet, type ExcelSheet } from "../../../lib/report/export/excel";
import { exportCardImage } from "../../../lib/report/export/image";
import { CardMessage } from "./card-message";
import { useReportServices } from "../../../hooks/report/report-context";

type PopupOption = { value?: string; label: string };

export type ReportCardProps = {
  title: string;
  subtitle: string;
  /** Excel header; the dates in full where the subtitle says "Últimos 12 meses". Defaults to the subtitle. */
  exportSubtitle?: string;
  cardId: string;
  /** Image export of this element only, on a transparent background (e.g. a map without its hints). */
  imageTargetId?: string;
  reportType?: "national" | "facility";
  loading: boolean;
  error: string | null;
  empty: boolean;
  onRetry: () => void;
  onSubmit?: (dates: [string, string], facilities?: PopupOption[], facilityType?: "province" | "district" | "clinic") => void;
  excel: () => ExcelSheet;
  onRestart?: () => void;
  onSelectLabs?: () => void;
  extraOptions?: MainCardHeaderOptions[];
  documentation: React.ReactNode;
  footer?: React.ReactNode;
  /** Always shown above the error, empty and data states (e.g. a tab switch that must stay reachable). */
  controls?: React.ReactNode;
  children: React.ReactNode;
};

export function ReportCard(props: ReportCardProps) {
  const { user } = useReportServices();
  const [exportError, setExportError] = useState<string | null>(null);
  const { title, subtitle, exportSubtitle, cardId, imageTargetId, excel, onRestart, onSelectLabs, extraOptions } = props;

  const options = useMemo<MainCardHeaderOptions[]>(
    () => [
      {
        label: "Exportar para Excel",
        icon: <PiMicrosoftExcelLogoFill size={20} />,
        type: "primary",
        action: () => {
          try {
            setExportError(null);
            exportSheet(title, exportSubtitle ?? subtitle, excel());
          } catch {
            setExportError("Não foi possível exportar para Excel.");
          }
        },
      },
      {
        label: "Exportar imagem",
        icon: <IoImageOutline size={20} />,
        type: "primary",
        action: () => {
          setExportError(null);
          exportCardImage(cardId, title, { targetId: imageTargetId }).catch((error) => {
            console.error("Image export failed:", error);
            setExportError("Não foi possível exportar a imagem.");
          });
        },
      },
      ...(onSelectLabs
        ? [{ label: "Seleccionar laboratórios", icon: <MdOutlineScience size={20} />, type: "primary" as const, action: onSelectLabs }]
        : []),
      ...(onRestart
        ? [{ label: "Reiniciar o relatório", icon: <VscDebugRestart size={20} />, type: "primary" as const, action: onRestart }]
        : []),
      ...(extraOptions ?? []),
    ],
    [title, subtitle, exportSubtitle, cardId, imageTargetId, excel, onRestart, onSelectLabs, extraOptions],
  );

  return (
    <MainCard
      title={title}
      subtitle={subtitle}
      chartId={cardId}
      reportType={props.reportType}
      loading={props.loading}
      additionalOptions={options}
      documentation={props.documentation}
      handleSubmit={props.onSubmit as never}
      footerComponent={props.footer}
      user={user}
      width="100%"
      height="auto"
    >
      <div className="px-4 pb-4">
        {exportError && <p className="mb-2 text-xs text-red-500">{exportError}</p>}
        {props.controls}
        {props.error ? (
          <CardMessage tone="error" message={props.error} onRetry={props.onRetry} />
        ) : props.empty && !props.loading ? (
          <CardMessage tone="empty" message="Sem dados para o período e filtros seleccionados." />
        ) : props.empty ? (
          // Loading with nothing to show yet: MainCard draws the skeleton on the first load and the
          // progress bar on later loads (filters, tabs, drill-down); never a full-card skeleton here.
          <div aria-hidden className="min-h-[240px]" />
        ) : (
          <div id={cardId}>{props.children}</div>
        )}
      </div>
    </MainCard>
  );
}
