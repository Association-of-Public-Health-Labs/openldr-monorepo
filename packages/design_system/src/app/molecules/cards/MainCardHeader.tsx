"use client";

import React, { useEffect, type ComponentType, type ReactNode } from "react";
import { EllipsisVertical } from "lucide-react";
import type { BoxProps } from "@mui/material";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { MENU_DASHED_SEPARATOR, MENU_ITEM, MENU_POPOVER } from "../../../lib/menu-styles";
import { cn } from "../../../lib/utils";

export type MainCardHeaderOptions = {
  label: string;
  icon?: React.ReactNode;
  action: () => void;
  disabled?: boolean;
  optionToExportData?: boolean;
  type?: "primary" | "secondary";
};

export type MainCardHeaderProps = {
  title?: string;
  subtitle?: string;
  options?: MainCardHeaderOptions[];
  additionalOptions?: MainCardHeaderOptions[];
  containerProps?: BoxProps;
  width?: string | number;
  handleSetContextOptions: (options: MainCardHeaderOptions[]) => void;
};

// Card menu items: Minimals item with a 20px icon. Icons come from react-icons with their own size.
export const CARD_MENU_ITEM = cn(MENU_ITEM, "gap-4 [&_svg]:size-5! [&_svg]:text-current");

/** Options shown in the card's menus: the inline `options` first, then primary, then secondary. */
export function cardMenuGroups(options: MainCardHeaderOptions[] = [], additionalOptions: MainCardHeaderOptions[] = []) {
  return {
    primary: [...options, ...additionalOptions.filter((o) => o.type === "primary")],
    secondary: additionalOptions.filter((o) => o.type === "secondary"),
  };
}

type ItemComponent = ComponentType<{ className?: string; disabled?: boolean; onSelect?: (e: Event) => void; children?: ReactNode }>;
type SeparatorComponent = ComponentType<{ className?: string }>;

/** The same items for the 3-dots dropdown and the right-click menu, which use different primitives. */
export function CardMenuItems({
  options,
  additionalOptions,
  Item,
  Separator,
}: {
  options?: MainCardHeaderOptions[];
  additionalOptions?: MainCardHeaderOptions[];
  Item: ItemComponent;
  Separator: SeparatorComponent;
}) {
  const { primary, secondary } = cardMenuGroups(options, additionalOptions);
  const item = (option: MainCardHeaderOptions, index: number) => (
    <Item key={`${option.label}-${index}`} className={CARD_MENU_ITEM} disabled={option.disabled} onSelect={() => option.action?.()}>
      {option.icon}
      {option.label}
    </Item>
  );
  return (
    <>
      {primary.map(item)}
      {primary.length > 0 && secondary.length > 0 && <Separator className={MENU_DASHED_SEPARATOR} />}
      {secondary.map(item)}
    </>
  );
}

// Measured on minimals.cc "Website visits" (2026-10-19): 24px 24px 0 header, 18px/28px semibold
// title, 14px/22px grey subtitle 4px below it. 12px below, as the old header, before the content.
export function MainCardHeader({ title, subtitle, options, additionalOptions, containerProps, width = "100%", handleSetContextOptions }: MainCardHeaderProps) {
  useEffect(() => {
    if (typeof additionalOptions !== "undefined" && typeof handleSetContextOptions !== "undefined") {
      handleSetContextOptions(additionalOptions);
    }
  }, [additionalOptions, handleSetContextOptions]);

  const hasMenu = (options?.length ?? 0) + (additionalOptions?.length ?? 0) > 0;

  return (
    <div
      data-slot="card-header"
      style={{ width }}
      className={cn("flex items-start gap-2 px-6 pt-6 pb-3", containerProps?.className)}
    >
      <div className="min-w-0 flex-1">
        <h5 className="text-lg leading-7 font-semibold text-[#1C252E] dark:text-white">{title}</h5>
        {subtitle && <p className="mt-1 text-sm leading-[22px] text-[#637381] dark:text-[#919EAB]">{subtitle}</p>}
      </div>
      {hasMenu && (
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Opções"
            className="-mt-1 -mr-2 flex size-9 shrink-0 items-center justify-center rounded-full text-[#637381] transition-colors outline-none hover:bg-[rgba(145,158,171,0.08)] focus-visible:bg-[rgba(145,158,171,0.16)] data-[state=open]:bg-[rgba(145,158,171,0.08)] dark:text-[#919EAB]"
          >
            <EllipsisVertical className="size-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={4} className={MENU_POPOVER}>
            <CardMenuItems options={options} additionalOptions={additionalOptions} Item={DropdownMenuItem} Separator={DropdownMenuSeparator} />
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
