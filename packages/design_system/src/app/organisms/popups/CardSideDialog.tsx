"use client";

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { CARD_FRAME } from "../cards/MainCard";
import { cn } from "../../../lib/utils";

/**
 * Dialog for a card's side panels (documentation, questions and suggestions), Minimals style:
 * a header with the panel title and the card's name; on wide screens the card preview on the
 * left (3/5) and the panel on the right (2/5), each scrolling on its own; on phones the panel
 * first and the preview below it, in one scroll.
 */
export function CardSideDialog({
  open,
  setOpen,
  heading,
  cardTitle,
  preview,
  children,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  heading: string;
  cardTitle?: string;
  preview: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex h-[min(90svh,860px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(1200px,calc(100%-2rem))]">
        <DialogHeader className="shrink-0 border-b border-dashed border-[rgba(145,158,171,0.2)] px-6 pt-6 pb-4 pr-16 text-left">
          <DialogTitle>{heading}</DialogTitle>
          <DialogDescription className={cn(!cardTitle && "sr-only")}>{cardTitle || heading}</DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:overflow-hidden">
          <div data-slot="card-side-panel" className="order-1 p-6 lg:order-2 lg:overflow-y-auto">
            {children}
          </div>
          <div
            data-slot="card-side-preview"
            className="order-2 border-t border-dashed border-[rgba(145,158,171,0.2)] bg-[#F4F6F8] p-4 lg:order-1 lg:overflow-y-auto lg:border-t-0 lg:border-r lg:p-6 dark:bg-[#141A21]"
          >
            <div className={cn(CARD_FRAME, "pointer-events-none select-none")} aria-hidden>
              {preview}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
