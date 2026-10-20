"use client";

import React, { useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Strikethrough,
  Underline,
  Unlink,
} from "lucide-react";
import { RichTextContent, type RichTextEditor as Editor } from "@repo/design_system_mui";
import { cn } from "../../../lib/utils";

const TOOL =
  "flex size-8 items-center justify-center rounded-md text-[#637381] transition-colors outline-none hover:bg-[rgba(145,158,171,0.08)] hover:text-[#1C252E] focus-visible:ring-2 focus-visible:ring-[rgba(145,158,171,0.32)] disabled:pointer-events-none disabled:opacity-40 dark:text-[#919EAB] dark:hover:text-white";
const TOOL_ON = "bg-[rgba(145,158,171,0.16)] text-[#1C252E] dark:text-white";

function Tool({ label, active, disabled, onClick, children }: { label: string; active?: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      // Keep the selection in the editor while clicking the toolbar.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(TOOL, active && TOOL_ON)}
    >
      {children}
    </button>
  );
}

const Divider = () => <span aria-hidden className="mx-1 h-5 w-px bg-[rgba(145,158,171,0.24)]" />;

/**
 * Minimals-style rich-text editor (Tailwind) around a Tiptap editor from `useRichTextEditor`:
 * a toolbar (bold, italic, underline, strike, lists, alignment, links) over the writing area,
 * in a 8px-radius outlined field.
 */
export function RichTextEditor({ editor, className }: { editor: Editor | null; className?: string }) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [url, setUrl] = useState("");

  if (!editor) return <div className={cn("h-48 rounded-lg border border-[rgba(145,158,171,0.32)]", className)} />;

  const chain = () => editor.chain().focus();
  const applyLink = () => {
    const href = url.trim();
    if (href) chain().extendMarkRange("link").setLink({ href: /^[a-z]+:\/\//i.test(href) ? href : `https://${href}` }).run();
    setLinkOpen(false);
    setUrl("");
  };

  return (
    <div
      data-slot="rich-text-editor"
      className={cn(
        "overflow-hidden rounded-lg border border-[rgba(145,158,171,0.32)] transition-colors focus-within:border-[#1C252E] dark:focus-within:border-white",
        className,
      )}
    >
      <div role="toolbar" aria-label="Formatação" className="flex flex-wrap items-center gap-0.5 border-b border-[rgba(145,158,171,0.2)] px-2 py-1.5">
        <Tool label="Negrito" active={editor.isActive("bold")} onClick={() => chain().toggleBold().run()}>
          <Bold className="size-4" />
        </Tool>
        <Tool label="Itálico" active={editor.isActive("italic")} onClick={() => chain().toggleItalic().run()}>
          <Italic className="size-4" />
        </Tool>
        <Tool label="Sublinhado" active={editor.isActive("underline")} onClick={() => chain().toggleUnderline().run()}>
          <Underline className="size-4" />
        </Tool>
        <Tool label="Riscado" active={editor.isActive("strike")} onClick={() => chain().toggleStrike().run()}>
          <Strikethrough className="size-4" />
        </Tool>
        <Divider />
        <Tool label="Lista" active={editor.isActive("bulletList")} onClick={() => chain().toggleBulletList().run()}>
          <List className="size-4" />
        </Tool>
        <Tool label="Lista numerada" active={editor.isActive("orderedList")} onClick={() => chain().toggleOrderedList().run()}>
          <ListOrdered className="size-4" />
        </Tool>
        <Divider />
        <Tool label="Alinhar à esquerda" active={editor.isActive({ textAlign: "left" })} onClick={() => chain().setTextAlign("left").run()}>
          <AlignLeft className="size-4" />
        </Tool>
        <Tool label="Centrar" active={editor.isActive({ textAlign: "center" })} onClick={() => chain().setTextAlign("center").run()}>
          <AlignCenter className="size-4" />
        </Tool>
        <Tool label="Alinhar à direita" active={editor.isActive({ textAlign: "right" })} onClick={() => chain().setTextAlign("right").run()}>
          <AlignRight className="size-4" />
        </Tool>
        <Divider />
        <Tool label="Inserir ligação" active={editor.isActive("link") || linkOpen} onClick={() => setLinkOpen((v) => !v)}>
          <Link2 className="size-4" />
        </Tool>
        <Tool label="Remover ligação" disabled={!editor.isActive("link")} onClick={() => chain().unsetLink().run()}>
          <Unlink className="size-4" />
        </Tool>
      </div>

      {linkOpen && (
        <div className="flex items-center gap-2 border-b border-[rgba(145,158,171,0.2)] px-3 py-2">
          <input
            autoFocus
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              }
              if (e.key === "Escape") setLinkOpen(false);
            }}
            placeholder="https://"
            aria-label="Endereço da ligação"
            className="h-8 min-w-0 flex-1 rounded-md border border-[rgba(145,158,171,0.32)] bg-transparent px-2 text-sm outline-none focus:border-[#1C252E] dark:focus:border-white"
          />
          <button
            type="button"
            onClick={applyLink}
            className="h-8 rounded-md px-3 text-sm font-bold text-[#1C252E] hover:bg-[rgba(145,158,171,0.08)] dark:text-white"
          >
            Aplicar
          </button>
        </div>
      )}

      <RichTextContent editor={editor} className="max-h-72 min-h-40 overflow-y-auto px-3.5 py-3 text-sm" />
    </div>
  );
}
