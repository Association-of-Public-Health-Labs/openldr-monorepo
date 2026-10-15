"use client";

import { Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { SidebarTrigger } from "../components/ui/sidebar";
import { initials } from "./shell-utils";

export interface ShellUser {
  name: string;
  email: string;
  imageUrl?: string;
}

function SettingsMenu() {
  const { theme, setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Definições" className="rounded-full p-2 hover:bg-accent">
        <Settings className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuLabel>Modo</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme ?? "light"} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light">Claro</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Escuro</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">Sistema</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
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

export function ShellHeader({ title, user, onSignOut }: { title: string; user: ShellUser; onSignOut: () => void }) {
  // z-40: above page content, below Radix popups (z-50) and MUI dialogs (z-1300).
  return (
    <header className="sticky top-0 z-40 flex h-20 w-full items-center justify-between gap-2 bg-background/40 px-4 backdrop-blur-[8px]">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger aria-label="Menu" />
        <h1 className="truncate text-base font-bold sm:text-lg md:text-xl lg:text-[1.375rem] xl:text-2xl">{title}</h1>
      </div>
      <div className="flex items-center gap-1">
        <SettingsMenu />
        <UserMenu user={user} onSignOut={onSignOut} />
      </div>
    </header>
  );
}
