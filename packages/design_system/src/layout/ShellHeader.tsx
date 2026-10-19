"use client";

import { Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { MENU_DASHED_SEPARATOR, MENU_ITEM, MENU_POPOVER } from "../lib/menu-styles";
import type { LayoutSettings } from "./layoutSettings";
import { SettingsDrawer } from "./SettingsDrawer";
import { initials } from "./shell-utils";
import { CONTENT_PADDING_X } from "./sidebar-styles";

export interface ShellUser {
  name: string;
  email: string;
  imageUrl?: string;
}

// Measured on minimals.cc (2026-10-15): 40px round header buttons, grey icons, Minimals popover.
export const HEADER_ICON_BUTTON =
  "flex size-10 items-center justify-center rounded-full text-[#637381] transition-colors hover:bg-[rgba(145,158,171,0.08)] dark:text-[#919EAB]";

function UserMenu({ user, onSignOut }: { user: ShellUser; onSignOut: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Conta" className="relative flex size-10 items-center justify-center rounded-full">
        {/* Thin primary-to-amber ring that slowly turns, as the Minimals account button. */}
        <span
          data-slot="avatar-ring"
          aria-hidden
          className="absolute inset-0 animate-[spin_6s_linear_infinite] rounded-full bg-[conic-gradient(var(--primary),#FFAB00,var(--primary))] [mask:radial-gradient(farthest-side,transparent_calc(100%-2px),#000_calc(100%-2px))]"
        />
        <Avatar className="size-[34px]">
          {user.imageUrl ? <AvatarImage src={user.imageUrl} alt="" /> : null}
          <AvatarFallback className="bg-purple-700 text-white">{initials(user.name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className={MENU_POPOVER}>
        <div className="px-2 pt-2 pb-1.5">
          <p className="truncate text-sm font-semibold text-[#1C252E] dark:text-white">{user.name}</p>
          <p className="truncate text-sm text-[#637381] dark:text-[#919EAB]">{user.email}</p>
        </div>
        <DropdownMenuSeparator className={MENU_DASHED_SEPARATOR} />
        <DropdownMenuItem className={MENU_ITEM}>Conta de Perfil</DropdownMenuItem>
        <DropdownMenuItem className={MENU_ITEM}>Configurações</DropdownMenuItem>
        <DropdownMenuSeparator className={MENU_DASHED_SEPARATOR} />
        <DropdownMenuItem className={`${MENU_ITEM} font-semibold`} onSelect={() => onSignOut()}>
          Sair da conta
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Content background (by contrast) at 40%, blurred, as the old layout's header. */
export function headerBackground(contrast: LayoutSettings["contrast"]): string {
  return contrast === "negative" ? "bg-white/40 dark:bg-[#1d232a]/40" : "bg-[#f4f4f4]/40 dark:bg-[#141a21]/40";
}

/** Mobile menu button, 40px round as the other header buttons; hidden from md up. */
export function MobileMenuButton({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <button type="button" aria-label="Menu" onClick={onOpenMenu} className={`${HEADER_ICON_BUTTON} md:hidden`}>
      <Menu className="size-6" />
    </button>
  );
}

/** Settings and account buttons, shared by the side and top layouts. */
export function HeaderActions({
  user,
  onSignOut,
  settings,
  onSettingsChange,
}: {
  user: ShellUser;
  onSignOut: () => void;
  settings: LayoutSettings;
  onSettingsChange: (settings: LayoutSettings) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <SettingsDrawer settings={settings} onChange={onSettingsChange} />
      <UserMenu user={user} onSignOut={onSignOut} />
    </div>
  );
}

export function ShellHeader({
  title,
  user,
  onSignOut,
  settings,
  onSettingsChange,
  onOpenMenu,
}: {
  title: string;
  user: ShellUser;
  onSignOut: () => void;
  settings: LayoutSettings;
  onSettingsChange: (settings: LayoutSettings) => void;
  onOpenMenu: () => void;
}) {
  // z-40: above page content, below Radix popups (z-50) and MUI dialogs (z-1300).
  return (
    <header
      className={`sticky top-0 z-40 flex h-16 w-full items-center justify-between gap-2 backdrop-blur-[8px] ${CONTENT_PADDING_X[settings.compact]} ${headerBackground(settings.contrast)}`}
    >
      <div className="flex min-w-0 items-center gap-2">
        <MobileMenuButton onOpenMenu={onOpenMenu} />
        <h1 className="truncate text-lg leading-7 font-semibold text-[#1C252E] dark:text-white">{title}</h1>
      </div>
      <HeaderActions user={user} onSignOut={onSignOut} settings={settings} onSettingsChange={onSettingsChange} />
    </header>
  );
}
