"use client";

import React from "react";
import { CardSideDialog } from "./CardSideDialog";

export type Props = {
  children: React.ReactNode;
  documentation?: React.ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
  loading?: boolean;
  /** The card's title, shown under the dialog title. */
  title?: string;
};

/** "Ver a Documentação": the card's documentation beside a preview of the card. */
export const CardDocsPopup = React.memo(function CardDocsPopup({ children, documentation, open, setOpen, title }: Props) {
  return (
    <CardSideDialog open={open} setOpen={setOpen} heading="Documentação" cardTitle={title} preview={children}>
      {documentation ?? <p className="text-sm text-[#637381] dark:text-[#919EAB]">Este relatório ainda não tem documentação.</p>}
    </CardSideDialog>
  );
});
