"use client";

import { useEffect, useState } from "react";
import { Clock, Maximize2, PlayCircle } from "lucide-react";
import { Button } from "@repo/design_system/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@repo/design_system/components/ui/dialog";
import { DEMO_DIALOG_SEEN_KEY, shouldAutoOpen } from "../lib/demo-video";
import { DemoPlayer } from "./demo-player";

const MUTED = "text-[#637381] dark:text-[#919EAB]";

/** Wait a moment after the page appears before opening the dialog by itself. */
const AUTO_OPEN_DELAY_MS = 900;

function readSeen(): string | null {
  try {
    return window.localStorage.getItem(DEMO_DIALOG_SEEN_KEY);
  } catch {
    return null;
  }
}

function markSeen() {
  try {
    window.localStorage.setItem(DEMO_DIALOG_SEEN_KEY, "1");
  } catch {
    // Private mode or blocked storage: the dialog simply opens again next visit.
  }
}

/**
 * The hero's "watch the demo" button and the dialog it opens. The dialog also opens by itself on a visitor's
 * first visit (and whenever the link ends in #demo); once closed, it stays closed until they click the button.
 */
export function DemoDialog({ pageUrl }: { pageUrl: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!shouldAutoOpen(readSeen(), window.location.hash)) return;
    const t = window.setTimeout(() => setOpen(true), AUTO_OPEN_DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      markSeen();
      if (window.location.hash === "#demo") history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" variant="outline">
          <PlayCircle />
          Ver o vídeo de demonstração
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto p-0 sm:max-w-4xl">
        <div className="px-6 pt-6 pb-5 pr-16">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#1C252E] px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-white uppercase dark:bg-white dark:text-[#1C252E]">
              Vídeo de demonstração
            </span>
            <span className={`inline-flex items-center gap-1 text-xs ${MUTED}`}>
              <Clock className="size-3.5" />8 minutos
            </span>
          </div>
          <DialogTitle className="mt-3 text-xl leading-snug font-bold sm:text-2xl">Conheça os portais do OpenLDR</DialogTitle>
          <DialogDescription className="mt-1.5 max-w-2xl leading-6">
            Veja como entrar e explorar os relatórios de Carga Viral, DPI e Tuberculose: navegação, filtros e as opções de
            cada relatório.
          </DialogDescription>
        </div>
        <DemoPlayer
          layout="dialog"
          actions={
            <>
              <Button asChild size="sm" variant="ghost">
                <a href={pageUrl}>
                  <Maximize2 />
                  Página inteira
                </a>
              </Button>
              <DialogClose asChild>
                <Button size="sm">Fechar</Button>
              </DialogClose>
            </>
          }
        />
      </DialogContent>
    </Dialog>
  );
}
