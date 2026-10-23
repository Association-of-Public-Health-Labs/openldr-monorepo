"use client";

import { useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { MainCard } from "@repo/design_system/app/organisms/cards/MainCard";
import { MainCardSkeleton } from "@repo/design_system/app/molecules/skeletons/MainCardSkeleton";
import type { MainCardHeaderOptions } from "@repo/design_system/app/molecules/cards/MainCardHeader";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { IoImageOutline } from "react-icons/io5";
import { VscDebugRestart } from "react-icons/vsc";
import { MdOutlineScience } from "react-icons/md";
import { exportSheet, type ExcelSheet } from "@/lib/vl/export/excel";
import { exportCardImage } from "@/lib/vl/export/image";
import { CardMessage } from "./card-message";

type PopupOption = { value?: string; label: string };

export type ReportCardProps = {
  title: string;
  subtitle: string;
  /** Excel header; the dates in full where the subtitle says "Últimos 12 meses". Defaults to the subtitle. */
  exportSubtitle?: string;
  cardId: string;
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
  children: React.ReactNode;
};

export function ReportCard(props: ReportCardProps) {
  const { user } = useUser();
  const [exportError, setExportError] = useState<string | null>(null);
  const { title, subtitle, exportSubtitle, cardId, excel, onRestart, onSelectLabs, extraOptions } = props;

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
          exportCardImage(cardId, title).catch((error) => {
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
    [title, subtitle, exportSubtitle, cardId, excel, onRestart, onSelectLabs, extraOptions],
  );

  if (props.loading && props.empty && !props.error) {
    return <MainCardSkeleton sx={{ width: "100%" }} />;
  }

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
      user={{ name: user?.fullName ?? "", email: user?.primaryEmailAddress?.emailAddress ?? "" }}
      width="100%"
      height="auto"
    >
      <div className="px-4 pb-4">
        {exportError && <p className="mb-2 text-xs text-red-500">{exportError}</p>}
        {props.error ? (
          <CardMessage tone="error" message={props.error} onRetry={props.onRetry} />
        ) : props.empty && !props.loading ? (
          <CardMessage tone="empty" message="Sem dados para o período e filtros seleccionados." />
        ) : (
          <div id={cardId}>{props.children}</div>
        )}
      </div>
    </MainCard>
  );
}
