"use client";

import React, { useState } from "react";
import { BoxProps } from "@mui/material";
import { IoCalendarOutline, IoFilterOutline } from "react-icons/io5";
import { format } from "date-fns";

import { DateRange } from "../../organisms/popups/DateRange";
import { FacilitiesPopup } from "../../organisms/popups/FacilitiesPopup";
import { LabDialog } from "../../organisms/popups/LabDialog";
import { CardMenuItems, MainCardHeader as Header, MainCardHeaderOptions } from "../../molecules/cards/MainCardHeader";
import { SelectPickerOptionsProps } from "../../atoms/pickers/SelectPicker";
import { CardChartSkeleton, CardProgressBar, useCardLoadingView } from "../../molecules/cards/CardLoading";
import { CardDocsPopup } from "../popups/CardDocsPopup";
import { SuggestionsPopup } from "../popups/SuggestionsPopup";
import { TbMessage2Question } from "react-icons/tb";
import { HiOutlineDocumentText } from "react-icons/hi";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../../../components/ui/context-menu";
import { MENU_POPOVER } from "../../../lib/menu-styles";
import { cn } from "../../../lib/utils";

export type MainCardProps = {
  id?: string;
  chartId?: string;
  title?: string;
  subtitle?: string;
  width?: string | number;
  height?: string | number;
  reportType?: "national" | "lab" | "facility";
  labType?: "conventional" | "poc";
  additionalOptions?: MainCardHeaderOptions[];
  children?: React.ReactNode;
  containerProps?: BoxProps;
  headerProps?: BoxProps;
  bodyProps?: BoxProps;
  footerComponent?: React.ReactNode;
  loading?: boolean;
  documentation?: React.ReactNode;
  handleSubmit?: (
    dates: [string, string],
    facilities?: SelectPickerOptionsProps[],
    facilityType?: "province" | "district" | "clinic",
    disaggregation?: "true" | "false",
    labType?: "conventional" | "poc" | "all"
  ) => void;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  csvFile?: any;
  previewMode?: boolean;
};

// Minimals card (minimals.cc "Website visits", 2026-10-19): 16px radius, no border, soft grey shadow.
export const CARD_FRAME =
  "relative flex flex-1 flex-col overflow-hidden rounded-2xl bg-white text-[#1C252E] shadow-[0_0_2px_0_rgba(145,158,171,0.2),0_12px_24px_-4px_rgba(145,158,171,0.12)] dark:bg-[#1d232a] dark:text-white dark:shadow-[0_0_2px_0_rgba(0,0,0,0.2),0_12px_24px_-4px_rgba(0,0,0,0.12)]";

// Outline icons, as the other menu items (Ionicons outline, like "Exportar imagem").
const EDIT_ITEMS: Record<NonNullable<MainCardProps["reportType"]>, { label: string; icon: React.ReactNode }> = {
  national: { label: "Editar período", icon: <IoCalendarOutline size={20} /> },
  facility: { label: "Editar filtros", icon: <IoFilterOutline size={20} /> },
  lab: { label: "Editar filtros", icon: <IoFilterOutline size={20} /> },
};

export function MainCard(props: MainCardProps) {
  const { title, width, height, reportType, additionalOptions = [], handleSubmit, documentation, user } = props;

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDocumentationDialog, setOpenDocumentationDialog] = useState(false);
  const [openSuggestionsDialog, setOpenSuggestionsDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSuggestionsSubmit = async (content: string, category: "suggestion" | "doubt") => {
    try {
      setIsSubmitting(true);

      const response = await fetch('/api/send-suggestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          category,
          reportTitle: title || 'Relatório',
          userEmail: user?.email || 'unknown@example.com',
          userName: user?.name || 'Unknown User',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send suggestion');
      }
    } catch (error) {
      console.error('Error sending suggestion:', error);
      // The dialog shows the error and keeps the text for another try.
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // The edit item replaces the old pencil button; it opens the card's filter dialog.
  const editOptions: MainCardHeaderOptions[] = reportType
    ? [{ ...EDIT_ITEMS[reportType], action: () => setOpenEditDialog(true), type: "primary" }]
    : [];
  const menuOptions: MainCardHeaderOptions[] = [
    ...additionalOptions,
    {
      label: "Ver a Documentação",
      icon: <HiOutlineDocumentText size={18} />,
      action: () => setOpenDocumentationDialog(true),
      disabled: false,
      optionToExportData: false,
      type: "secondary",
    },
    {
      label: "Dúvidas e Sugestões",
      icon: <TbMessage2Question size={18} />,
      action: () => setOpenSuggestionsDialog(true),
      type: "secondary",
    },
  ];

  return (
    <>
      {openDocumentationDialog && (
        <CardDocsPopup open={openDocumentationDialog} setOpen={setOpenDocumentationDialog} documentation={documentation} title={title}>
          <MainCardContent {...props} previewMode={true} />
        </CardDocsPopup>
      )}
      {openSuggestionsDialog && (
        <SuggestionsPopup
          open={openSuggestionsDialog}
          setOpen={setOpenSuggestionsDialog}
          onSubmit={handleSuggestionsSubmit}
          loading={isSubmitting}
          title={title}
        >
          <MainCardContent {...props} previewMode={true} />
        </SuggestionsPopup>
      )}
      {/* Right-click anywhere on the card opens the same options as the 3-dots menu. */}
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div data-slot="main-card" className={CARD_FRAME} style={{ width, height }}>
            <MainCardContent {...props} options={editOptions} additionalOptions={menuOptions} />
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className={MENU_POPOVER}>
          <CardMenuItems options={editOptions} additionalOptions={menuOptions} Item={ContextMenuItem} Separator={ContextMenuSeparator} />
        </ContextMenuContent>
      </ContextMenu>
      {/* Outside the right-click area: React events from these portalled dialogs bubble to their React parent. */}
      {reportType === "national" && (
        <DateRange
          open={openEditDialog}
          handleSubmit={(dates) => handleSubmit?.(dates)}
          onClose={() => setOpenEditDialog(false)}
        />
      )}
      {reportType === "facility" && (
        <FacilitiesPopup
          open={openEditDialog}
          handleSubmit={(facilities, facilityType, dates) => handleSubmit?.(dates, facilities, facilityType)}
          onClose={() => setOpenEditDialog(false)}
          facilities={{ clinics: [], districts: [], labs: [], pocs: [] }}
          isMulti={true}
        />
      )}
      {reportType === "lab" && (
        <LabDialog
          onCancel={() => setOpenEditDialog(false)}
          onApply={(params) =>
            handleSubmit?.(
              [
                params?.date?.from ? format(params.date.from, "yyyy-MM-dd") : "",
                params?.date?.to ? format(params.date.to, "yyyy-MM-dd") : "",
              ],
              params?.selectedDistricts,
              undefined,
              undefined,
              undefined
            )
          }
          open={openEditDialog}
          setOpen={setOpenEditDialog}
        />
      )}
    </>
  );
}

type MainCardContentProps = MainCardProps & { options?: MainCardHeaderOptions[] };

/** Header, body, footer and loading state (skeleton on the first load, progress bar on reloads). In preview mode (inside the docs and suggestions dialogs) it has no menu. */
function MainCardContent(props: MainCardContentProps) {
  const { title, subtitle, options = [], additionalOptions = [], loading, children, headerProps, bodyProps, footerComponent, previewMode = false } = props;
  const view = useCardLoadingView(Boolean(loading));

  return (
    <>
      <Header
        title={title}
        subtitle={subtitle}
        options={previewMode ? [] : options}
        additionalOptions={previewMode ? [] : additionalOptions}
        containerProps={headerProps}
        handleSetContextOptions={() => {}}
      />
      <div
        data-slot="card-body"
        className={cn(
          "relative flex-1 transition-opacity duration-200",
          view === "refresh" && "pointer-events-none opacity-[0.48]",
          view === "skeleton" && "min-h-[240px]",
          bodyProps?.className,
        )}
      >
        {/* Children stay mounted under the loading states (chart ids, exports, state). */}
        {children}
        {view === "skeleton" && <CardChartSkeleton />}
      </div>
      {footerComponent && (
        <div data-slot="card-footer" className="border-t border-dashed border-[rgba(145,158,171,0.2)] p-4">
          {footerComponent}
        </div>
      )}
      {view === "refresh" && <CardProgressBar />}
    </>
  );
}
