"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import type { LayoutSettings } from "./layoutSettings";
import { SettingsGearIcon } from "./settings-drawer-icons";
import { SettingsPanel } from "./SettingsPanel";

/**
 * The settings drawer, in the Minimals style. Same settings as the old MUI drawer; it reads
 * `settings` directly (no local copy), so it always shows the current state.
 */
export function SettingsDrawer({
  settings,
  onChange,
  open: openProp,
  onOpenChange,
}: {
  settings: LayoutSettings;
  onChange: (next: LayoutSettings) => void;
  /** Optional control, so other panels (the account drawer) can open it. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [openState, setOpenState] = React.useState(false);
  const open = openProp ?? openState;
  const setOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label="settings"
        className="flex size-10 items-center justify-center rounded-full text-[#637381] transition-colors hover:bg-[rgba(145,158,171,0.08)] dark:text-[#919EAB]"
      >
        <SettingsGearIcon />
      </Dialog.Trigger>
      <Dialog.Portal>
        {/* Transparent backdrop, as the old drawer and Minimals: closes on outside click without dimming. */}
        <Dialog.Overlay className="fixed inset-0 z-[1200] bg-transparent" />
        <Dialog.Content
          aria-describedby={undefined}
          // Focus the panel itself on open (keyboard users land inside it) instead of the close button,
          // which would otherwise show its focus ring on every mouse-opened drawer.
          tabIndex={-1}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            (event.currentTarget as HTMLElement | null)?.focus();
          }}
          className="outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right fixed inset-y-0 right-0 z-[1200] h-full w-[360px] max-w-full bg-white/90 shadow-[-40px_40px_80px_-8px_rgba(145,158,171,0.24)] backdrop-blur-[20px] dark:bg-[#141A21]/90 dark:shadow-[-40px_40px_80px_-8px_rgba(0,0,0,0.24)]"
        >
          <Dialog.Title className="sr-only">Configurações</Dialog.Title>
          <SettingsPanel settings={settings} onChange={onChange} onClose={() => setOpen(false)} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
