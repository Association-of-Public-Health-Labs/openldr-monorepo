"use client";

import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useRichTextEditor } from "@repo/design_system_mui";
import { SEGMENTED_ITEM, SEGMENTED_ITEM_ACTIVE, SEGMENTED_TRACK } from "../../../components/ui/segmented-tabs";
import { DIALOG_BUTTON_OUTLINE, DIALOG_BUTTON_PRIMARY } from "../../../lib/dialog-styles";
import { cn } from "../../../lib/utils";
import { RichTextEditor } from "../../molecules/editor/RichTextEditor";
import { CardSideDialog } from "./CardSideDialog";

type Category = "doubt" | "suggestion";

export type Props = {
  children: React.ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Sends the message (HTML). Rejecting shows the error and keeps the text, so it can be sent again. */
  onSubmit: (content: string, category: Category) => void | Promise<void>;
  loading?: boolean;
  /** The card's title, shown under the dialog title. */
  title?: string;
};

const CATEGORIES: { value: Category; label: string; placeholder: string }[] = [
  { value: "doubt", label: "Dúvida", placeholder: "Escreva a sua dúvida sobre este relatório…" },
  { value: "suggestion", label: "Sugestão", placeholder: "Escreva a sua sugestão para este relatório…" },
];

type Status = "idle" | "sending" | "sent" | "error";

/** "Dúvidas e Sugestões": a message about the card, beside a preview of the card. */
export const SuggestionsPopup = React.memo(function SuggestionsPopup({ children, open, setOpen, onSubmit, loading, title }: Props) {
  const [category, setCategory] = useState<Category>("doubt");
  const [status, setStatus] = useState<Status>("idle");
  const current = CATEGORIES.find((c) => c.value === category)!;
  // Read on every redraw, so the placeholder follows the chosen category.
  const placeholderRef = useRef(current.placeholder);
  placeholderRef.current = current.placeholder;
  const editor = useRichTextEditor(() => placeholderRef.current);

  // Redraw the (empty) editor so the new placeholder shows.
  useEffect(() => {
    if (editor && !editor.isDestroyed) editor.view.dispatch(editor.state.tr);
  }, [editor, category]);

  const empty = !editor || editor.isEmpty;
  const sending = status === "sending" || Boolean(loading);

  const send = async () => {
    if (!editor || empty) return;
    setStatus("sending");
    try {
      await onSubmit(editor.getHTML(), category);
      editor.commands.clearContent();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <CardSideDialog open={open} setOpen={setOpen} heading="Dúvidas e Sugestões" cardTitle={title} preview={children}>
      <div className="space-y-5">
        <p className="text-sm leading-[22px] text-[#637381] dark:text-[#919EAB]">
          Tem uma dúvida sobre este relatório ou uma ideia para o melhorar? Escreva-nos: a mensagem é enviada à equipa do
          OpenLDR com o nome do relatório.
        </p>

        <div role="radiogroup" aria-label="Tipo de mensagem" className={SEGMENTED_TRACK}>
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              role="radio"
              aria-checked={category === c.value}
              onClick={() => {
                setCategory(c.value);
                if (status !== "sending") setStatus("idle");
              }}
              className={cn(SEGMENTED_ITEM, "h-8 text-sm", category === c.value && SEGMENTED_ITEM_ACTIVE)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <RichTextEditor editor={editor} />

        {status === "sent" && (
          <p role="status" className="flex items-center gap-2 rounded-lg bg-[rgba(34,197,94,0.12)] px-3 py-2 text-sm font-semibold text-[#118D57] dark:text-[#77ED8B]">
            <CheckCircle2 className="size-4 shrink-0" /> Mensagem enviada. Obrigado!
          </p>
        )}
        {status === "error" && (
          <p role="alert" className="flex items-center gap-2 rounded-lg bg-[rgba(255,86,48,0.12)] px-3 py-2 text-sm font-semibold text-[#B71D18] dark:text-[#FFAC82]">
            <AlertCircle className="size-4 shrink-0" /> Não foi possível enviar a mensagem. Tente novamente.
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button type="button" className={DIALOG_BUTTON_OUTLINE} onClick={() => setOpen(false)}>
            {status === "sent" ? "Fechar" : "Cancelar"}
          </button>
          <button type="button" className={DIALOG_BUTTON_PRIMARY} disabled={empty || sending} onClick={send}>
            {sending ? "A enviar…" : "Enviar"}
          </button>
        </div>
      </div>
    </CardSideDialog>
  );
});
