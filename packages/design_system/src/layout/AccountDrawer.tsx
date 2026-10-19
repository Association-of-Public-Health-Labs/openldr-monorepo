"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, LayoutGrid, LogOut, Settings, UserRound, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { getDashboards, type DashboardId } from "../dashboards";
import { initials, switcherItems } from "./shell-utils";

export interface AccountUser {
  name: string;
  email: string;
  imageUrl?: string;
}

// Thin primary-to-amber ring that slowly turns, as the Minimals account button and drawer avatar.
const RING =
  "absolute inset-0 animate-[spin_6s_linear_infinite] rounded-full bg-[conic-gradient(var(--primary),#FFAB00,var(--primary))] [mask:radial-gradient(farthest-side,transparent_calc(100%-2px),#000_calc(100%-2px))]";

// Measured on minimals.cc (2026-10-19): 40px rows, 8px padding, 24px grey icons, 14px grey text.
const ROW =
  "flex h-10 w-full items-center gap-4 rounded-lg px-2 text-left text-sm text-[#637381] transition-colors outline-none hover:bg-[rgba(145,158,171,0.08)] hover:text-[#1C252E] focus-visible:bg-[rgba(145,158,171,0.16)] dark:text-[#919EAB] dark:hover:text-white";
const DASHED = "border-t border-dashed border-[rgba(145,158,171,0.2)]";

function AccountAvatar({ user, className }: { user: AccountUser; className: string }) {
  return (
    <Avatar className={className}>
      {user.imageUrl ? <AvatarImage src={user.imageUrl} alt="" /> : null}
      <AvatarFallback className="bg-purple-700 text-white">{initials(user.name)}</AvatarFallback>
    </Avatar>
  );
}

/**
 * The account drawer, after the Minimals one: opened from the header avatar, 320px from the right,
 * with the user, profile and settings, the OpenLDR dashboards and sign-out.
 */
export function AccountDrawer({
  user,
  dashboard,
  onSignOut,
  onOpenProfile,
  onOpenSettings,
}: {
  user: AccountUser;
  dashboard: DashboardId;
  onSignOut: () => void;
  /** Opens the account's profile (e.g. Clerk's); the item is hidden without it. */
  onOpenProfile?: () => void;
  onOpenSettings: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const dashboards = switcherItems(dashboard, getDashboards());
  // Close first, so the next panel (profile or settings) is not stacked under this one.
  const then = (action: () => void) => () => {
    setOpen(false);
    action();
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger aria-label="Conta" className="relative flex size-10 items-center justify-center rounded-full">
        <span data-slot="avatar-ring" aria-hidden className={RING} />
        <AccountAvatar user={user} className="size-[34px]" />
      </Dialog.Trigger>
      <Dialog.Portal>
        {/* Transparent backdrop, as Minimals: closes on outside click without dimming. */}
        <Dialog.Overlay className="fixed inset-0 z-[1200] bg-transparent" />
        <Dialog.Content
          aria-describedby={undefined}
          tabIndex={-1}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            (event.currentTarget as HTMLElement | null)?.focus();
          }}
          className="fixed inset-y-0 right-0 z-[1200] flex h-full w-[320px] max-w-full flex-col bg-white/90 shadow-[-40px_40px_80px_-8px_rgba(145,158,171,0.24)] outline-none backdrop-blur-[20px] data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:animate-in data-[state=open]:slide-in-from-right dark:bg-[#141A21]/90 dark:shadow-[-40px_40px_80px_-8px_rgba(0,0,0,0.24)]"
        >
          <Dialog.Close
            aria-label="Fechar"
            className="absolute top-3 left-3 flex size-9 items-center justify-center rounded-full text-[#637381] transition-colors hover:bg-[rgba(145,158,171,0.08)] dark:text-[#919EAB]"
          >
            <X className="size-5" />
          </Dialog.Close>

          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col items-center px-5 pt-16 pb-6 text-center">
              <span className="relative flex size-24 items-center justify-center">
                <span aria-hidden className={RING} />
                <AccountAvatar user={user} className="size-[84px] text-2xl" />
              </span>
              <Dialog.Title className="mt-6 w-full truncate text-base leading-6 font-semibold text-[#1C252E] dark:text-white">
                {user.name || "Utilizador"}
              </Dialog.Title>
              <p className="mt-1 w-full truncate text-sm text-[#637381] dark:text-[#919EAB]">{user.email}</p>
            </div>

            <nav aria-label="Conta" className={`flex flex-col px-5 py-3 ${DASHED}`}>
              {onOpenProfile && (
                <button type="button" className={ROW} onClick={then(onOpenProfile)}>
                  <UserRound className="size-6 shrink-0" />
                  Meu perfil
                </button>
              )}
              <button type="button" className={ROW} onClick={then(onOpenSettings)}>
                <Settings className="size-6 shrink-0" />
                Configurações
              </button>
            </nav>

            <div className={`px-5 py-3 ${DASHED}`}>
              <p className="flex items-center gap-4 px-2 pb-1 text-xs font-bold tracking-wide text-[#919EAB] uppercase">
                <LayoutGrid className="size-4" aria-hidden />
                Painéis
              </p>
              <ul className="flex flex-col">
                {dashboards.map((d) => (
                  <li key={d.id}>
                    {d.current ? (
                      <span aria-current="page" className={`${ROW} font-semibold text-[#1C252E] hover:bg-transparent dark:text-white`}>
                        <span aria-hidden className="ml-2 size-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.primary }} />
                        <span className="flex-1 truncate">{d.name}</span>
                        <Check className="size-4" aria-label="Painel atual" />
                      </span>
                    ) : (
                      <a href={d.href} className={ROW}>
                        <span aria-hidden className="ml-2 size-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.primary }} />
                        <span className="flex-1 truncate">{d.name}</span>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Minimals' soft error button. */}
          <div className="p-5">
            <button
              type="button"
              onClick={then(onSignOut)}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[rgba(255,86,48,0.16)] text-sm font-bold text-[#B71D18] transition-colors hover:bg-[rgba(255,86,48,0.32)] dark:text-[#FFAC82]"
            >
              <LogOut className="size-4" aria-hidden />
              Sair da conta
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
