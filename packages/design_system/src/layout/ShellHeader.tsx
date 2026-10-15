"use client";

import { Menu } from "lucide-react";
import { SettingsDrawer } from "../app/molecules/headers/SettingsDrawer";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import type { LayoutSettings } from "./layoutSettings";
import { initials } from "./shell-utils";
import { CONTENT_PADDING_X } from "./sidebar-styles";

export interface ShellUser {
  name: string;
  email: string;
  imageUrl?: string;
}

function UserMenu({ user, onSignOut }: { user: ShellUser; onSignOut: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Conta" className="rounded-full">
        <Avatar className="size-[30px]">
          {user.imageUrl ? <AvatarImage src={user.imageUrl} alt="" /> : null}
          <AvatarFallback className="bg-purple-700 text-white">{initials(user.name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <div className="px-3 py-2">
          <p className="font-bold">{user.name}</p>
          <p className="text-sm">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Conta de Perfil</DropdownMenuItem>
        <DropdownMenuItem>Configurações</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => onSignOut()}>Sair da conta</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
  // As the old layout: the content background (by contrast) at 40%, blurred.
  const background =
    settings.contrast === "negative" ? "bg-white/40 dark:bg-[#1d232a]/40" : "bg-[#f4f4f4]/40 dark:bg-[#141a21]/40";
  // z-40: above page content, below Radix popups (z-50) and MUI dialogs (z-1300).
  return (
    <header
      className={`sticky top-0 z-40 flex h-20 w-full items-center justify-between gap-2 backdrop-blur-[8px] ${CONTENT_PADDING_X[settings.compact]} ${background}`}
    >
      <div className="flex min-w-0 items-center gap-2">
        <button type="button" aria-label="Menu" onClick={onOpenMenu} className="rounded-md p-2 hover:bg-accent md:hidden">
          <Menu className="size-5" />
        </button>
        <h1 className="truncate text-base font-bold sm:text-lg md:text-xl lg:text-[1.375rem] xl:text-2xl">{title}</h1>
      </div>
      <div className="flex items-center gap-1">
        {/* key: the old drawer copies `layout` into local state on mount; remount it when the round button changes it. */}
        <SettingsDrawer key={settings.layout} settings={settings} handleSetAppSettings={onSettingsChange} />
        <UserMenu user={user} onSignOut={onSignOut} />
      </div>
    </header>
  );
}
